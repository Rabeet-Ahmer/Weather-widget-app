"use client";
import {useState,ChangeEvent,FormEvent} from "react";
import {Card,CardHeader,CardTitle,CardDescription,CardContent} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CloudIcon,MapPinIcon,ThermometerIcon} from "lucide-react";

interface WeatherData{
    temperature:number;
    description:string;
    location:string;
    unit:string;
}

export default function WeatherWidget(){
const [location,setLocation]=useState<string>("");
const [weather,setWeather]=useState<WeatherData|null>(null);
const [error,setError]=useState<string|null>(null);
const [isLoading,setIsLoading]=useState<boolean>(false);

const handleSearch= async (e:FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedLocation=location.trim();
    if(trimmedLocation === ""){
        setError("Please enter a valid location.");
        setWeather(null);
        return;
    }

    setIsLoading(true);
    setError(null);

    try{
        const response=await fetch(`https://api.weatherapi.com/v1/current.json?key=${process.env.NEXT_PUBLIC_WEATHER_API_KEY}&q=${trimmedLocation}`);
        if(!response.ok){
            throw new Error("City not found.")
        }

        const data=await response.json();

        const weatherData:WeatherData={
            temperature: data.current.temp_c,
            description: data.current.condition.text,
            location: data.location.name,
            unit: "C",
        };
        setWeather(weatherData);
    }
    catch (error){
        console.error("Error fetching weather data:",error);
        setError("City not found. Please try again.");
        setWeather(null);
    }
    finally{
        setIsLoading(false);
    }
};

const getTemperatureMessege=(temperature:number,unit:string):string=>{
    if(unit==="C"){
        if(temperature<0){
            return `It's freazing at ${temperature}°C! Bundle up!`;
        }
        else if(temperature<10){
            return `It's quite cold at ${temperature}°C. Wear warm clothes.`;
        }
        else if(temperature<20){
            return `The temperature is ${temperature}°C. Comfortable with a jacket.`
        }
        else if(temperature<30){
            return `It's a pleasant temperature with ${temperature}°C. Enjoy the nice weather!`;
        }
        else{
            return `It's hot at ${temperature}°C. Stay hydrated!`;
        }
    }
    else{
        return `${temperature}°${unit}`;
    }
}

const getWeatherMessege=(description:string):string=>{
    switch(description.toLowerCase()){
        case "sunny":
            return "It's a beautiful sunny day!";
        case "partly cloudy":
            return "Expected sunshine and partly cloudy.";
        case "cloudy":
            return "It's cloudy today.";
        case "overcast":
            return "The sky is overcast.";
        case "rain":
            return "Don't forgetyour umbrella. It's raining.";
        case "thunderstorm":
            return "Thunderstorms are expected today.";
        case "snow":
            return "Bundle up! It's snowing.";
        case "mist":
            return "It's misty outside.";
        case "fog":
            return "Be careful, there's fog outside.";
        default:
            return description;                
    }
}

const getLocationMessege=(location:string):string=>{
    const currentHour= new Date().getHours();
    const isNight= currentHour>=18 || currentHour<6;
    return `${location} ${isNight?"at Night":"During the Day"}`; 
}

return(
    <div className="flex bg-slate-950 justify-center items-center h-screen">
        <Card className="bg-slate-50 w-full max-w-md mx-auto text-center shadow drop-shadow-xl shadow-slate-800 ">
            <CardHeader>
                <CardTitle>Weather Widget</CardTitle>
                <CardDescription>
                    Search for the current weather condition in your city.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                    <Input
                       type="text"
                       placeholder="Enter a city name"
                       value={location}
                       onChange={
                        (e:ChangeEvent<HTMLInputElement>)=>
                            setLocation(e.target.value)
                       }
                    />
                    <Button type="submit" disabled={isLoading}>
                        {isLoading? "Loading...":"Search"}{""}
                    </Button>
                </form>
                {error && <div className="mt-4 text-red-500">{error}</div>}
                {weather && (
                    <div className="justify-center mt-4 grid gap-2">
                        <div className="flex items-center gap-2">
                            <div className="flex flex-col items-center gap-2">
                                <ThermometerIcon className="w-6 h-6"/>
                                {getTemperatureMessege(weather.temperature,weather.unit)}
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <CloudIcon className="w-6 h-6"/>
                            <div>{getWeatherMessege(weather.description)}</div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <MapPinIcon className="w-6 h-6"/>
                            <div>{getLocationMessege(weather.location)}</div>
                        </div>    
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
);
}