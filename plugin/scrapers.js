// Plugin scrapers.js - adapted for this bot structure
const axios = require('axios');
const fs = require('fs');

module.exports = {
  command: ["movie", "weather", "joke", "fact"],
  type: "search",
  owner: false,
  description: "Various scrapers for movie info, weather, jokes, and facts",
  execute: async ({ X, m, args, command, text }) => {
    
    if (command === "movie") {
      if (!text) return m.reply("_Need a movie name!_");
      
      try {
        const { data } = await axios(`http://www.omdbapi.com/?apikey=742b2d09&t=${text}&plot=full`);
        if (data.Response !== 'True') return m.reply(`_${data.Error}_`);
        
        let msg = '';
        msg += `_*${data.Title}*_ (${data.Year})\n\n`;
        msg += `*📅 Released:* ${data.Released}\n`;
        msg += `*⏱️ Runtime:* ${data.Runtime}\n`;
        msg += `*🎭 Genre:* ${data.Genre}\n`;
        msg += `*🎬 Director:* ${data.Director}\n`;
        msg += `*✍️ Writer:* ${data.Writer}\n`;
        msg += `*🎭 Actors:* ${data.Actors}\n`;
        msg += `*📖 Plot:* ${data.Plot}\n`;
        msg += `*🗣️ Language:* ${data.Language}\n`;
        msg += `*🌍 Country:* ${data.Country}\n`;
        msg += `*🏆 Awards:* ${data.Awards}\n`;
        msg += `*💰 BoxOffice:* ${data.BoxOffice}\n`;
        msg += `*⭐ IMDB Rating:* ${data.imdbRating}\n`;
        msg += `*🗳️ IMDB Votes:* ${data.imdbVotes}`;
        
        const posterApi = await axios(`https://api.themoviedb.org/3/search/movie?api_key=15d2ea6d0dc1d476efbca3eba2b9bbfb&query=${data.Title}`);
        const poster = posterApi.data.total_results !== 0 ? 
          "https://image.tmdb.org/t/p/w500/" + posterApi.data.results[0].poster_path : 
          data.Poster;
        
        await X.sendMessage(m.chat, {
          image: { url: poster },
          caption: msg
        }, { quoted: m });
        
      } catch (error) {
        console.error("Movie search error:", error);
        m.reply("❌ Failed to search movie");
      }
    }
    
    if (command === "joke") {
      try {
        const response = await axios.get("https://official-joke-api.appspot.com/random_joke");
        const joke = response.data;
        m.reply(`😂 *Joke Time!*\n\n*${joke.setup}*\n\n_${joke.punchline}_`);
      } catch (error) {
        m.reply("❌ Failed to fetch joke");
      }
    }
    
    if (command === "fact") {
      try {
        const response = await axios.get("https://uselessfacts.jsph.pl/random.json?language=en");
        const fact = response.data;
        m.reply(`🧠 *Did you know?*\n\n_${fact.text}_`);
      } catch (error) {
        m.reply("❌ Failed to fetch fact");
      }
    }
    
    if (command === "weather") {
      if (!text) return m.reply("_Need a city name!_");
      
      try {
        // Using a free weather API
        const response = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${text}&appid=YOUR_API_KEY&units=metric`);
        const weather = response.data;
        
        let msg = `🌤️ *Weather for ${weather.name}*\n\n`;
        msg += `*🌡️ Temperature:* ${weather.main.temp}°C\n`;
        msg += `*🌡️ Feels like:* ${weather.main.feels_like}°C\n`;
        msg += `*💨 Humidity:* ${weather.main.humidity}%\n`;
        msg += `*📊 Pressure:* ${weather.main.pressure} hPa\n`;
        msg += `*☁️ Description:* ${weather.weather[0].description}\n`;
        msg += `*💨 Wind Speed:* ${weather.wind.speed} m/s`;
        
        m.reply(msg);
      } catch (error) {
        m.reply("❌ Failed to fetch weather data. Make sure to add your OpenWeatherMap API key.");
      }
    }
  }
};