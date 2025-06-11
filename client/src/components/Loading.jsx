import { useEffect, useState } from "react";

function Loading() {
    const loadingMessages = [
        "Bon voyage, world explorer! Don't forget to pack your smile (and your charger). 😄🧳",
        "Wishing you safe travels and magical memories! May your trip be Instagram-worthy at every turn. 📸✨",
        "Go make some memories that your couch will be jealous of. 🛋️➡️🌄",
        "May your coffee be strong, your flights be smooth, and your playlists be fire. ☕🎧✈️",
        "Don't come back without at least one funny story and one delicious food pic! 🍜📷",
        "Travel safe, laugh often, and don't let Google Maps boss you around too much. 🗺️😂",
        "Pack your socks, your sense of adventure, and maybe a snack for the road. 🧦🌍🍫",
        "You're off to new places — don't forget to take your curiosity with you. 🤓🌏",
        "Wishing you smooth roads, clear skies, and no weird airport delays. 🛫🌤️🕒",
        "Hope your trip is filled with \“wow!\” moments and zero lost luggage. 🎒💥",
        "May your journey be even more epic than your travel playlist. 🎶🗺️",
        "You're going to have the best time — I can already hear your future travel stories! 📖❤️",
        "Try new things, take goofy pictures, and say yes to (almost) everything! 😄📷🍤",
        "Have the kind of trip that makes the group chat jealous. 💬🔥",
        "Sending hugs and sunscreen. Can't wait to hear all about it when you're back! 🤗🧴🌞",
        "Drink water like your skin is made of it (because it is). 💧✨",
        "Stretch your body — it's not a statue, it needs love! 🤸‍♂️🫶",
        "Eat something colorful (and no, candy doesn't count... mostly). 🌈🥦🍓",
        "Go outside and let the sun flirt with your face a little. ☀️😌",
        "Your brain deserves breaks — go stare at a tree or something. 🌳😴",
        "You don't have to do it all. \“No\” is a complete sentence. 🚫🧘",
        "Text someone who makes you laugh — your soul needs it. 😂📱",
        "Clean one small thing. Boom, you're productive. 🧼🏆",
        "Put on cozy socks. Cozy socks fix most things. 🧦🧸",
        "Talk kindly to yourself — your inner voice should be your BFF. 💬💖",
        "Move your body in a way that feels like fun, not punishment. 💃🎶",
        "Breathe in, breathe out, pretend you're a peaceful forest creature. 🦊🌿",
        "Celebrate tiny wins. Brushed your teeth? You're crushing it. 🦷🏅",
        "Rest is productive. So is doing absolutely nothing. 🛌📵",
        "Remind yourself: You are doing your best, and that's enough. 🌟🫂"
    ];
    const randomMessageIndex = Math.floor(Math.random() * loadingMessages.length);
    const [index, setIndex] = useState(randomMessageIndex);
    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((Math.floor(Math.random() * loadingMessages.length)))
        }, 10000); // Change message every 10 seconds
        return () => clearInterval(interval);
    }, [loadingMessages.length])
    return (
        <div className="trip-image">
            <h2>Loading...</h2>
            <p>{loadingMessages[index]}</p>
        </div>
    )
}

export default Loading;