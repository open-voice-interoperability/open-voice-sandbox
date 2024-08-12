import requests

def get_weather(api_key, city):
    base_url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric"
    response = requests.get(base_url)
    weather_data = response.json()
    return weather_data

def parse_weather_data(weather_data):
    main = weather_data["main"]
    temp = main["temp"]
    humidity = main["humidity"]
    weather_report = weather_data["weather"][0]["description"]
    return temp, humidity, weather_report