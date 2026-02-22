export const passwordMessage = 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 digit';

// Password regex: at least 8 characters, 1 digit, 1 lowercase, 1 uppercase
export const passwordRegex = /^.*(?=.{8,})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/;

export const ACCESS_TTL_SECONDS = 15 * 60; // 15 min
export const REFRESH_TTL_DAYS = 30;

export const quotes = [
  {
    quote: `"Daddy! Mommy! Un-make me, and save me from the hell of living!"`,
    subquote: `-Longlegs, 'Longlegs'`,
  },
  {
    quote: '"I never disrobe before gunplay."',
    subquote: "-John Miltion, 'Drive Angry'",
  },
  {
    quote: `"Cause I was made for this sewer baby and I am the king."`,
    subquote: `-Rick Santoro, 'Snake Eyes'.`,
  },
  {
    quote: `"Put the bunny back in the box."`,
    subquote: `-Cameron Poe, 'Con Air'.`,
  },
  {
    quote: `"What's in the bag? A shark or something?"`,
    subquote: `-Edward Malus, 'The Wicker Man'.`,
  },
  {
    quote: `"Shoot him again... His soul's still dancing."`,
    subquote: `-Terence McDonagh, 'Bad Lieutenant: Port of Call New Orleans'`,
  },
  {
    quote: `"I did a bare 360 triple backflip in front of twenty-two thousand people. It's kind of funny, it's on YouTube, check it out"`,
    subquote: `-Johnny Blaze, 'Ghost Rider: Spirit Of Vengeance'`,
  },
  { 
    quote: `"I just stole fifty cars in one night! I'm a little tired, little wired, and I think I deserve a little appreciation!"`,
    subquote: `-Randall 'Memphis' Raines, 'Gone In Sixty Seconds'`,
  },
  {
    quote: `"Bangers and mash! Bubbles and squeak! Smoked eel pie! Haggis!"`,
    subquote: `-Ben Gates, 'National Treasure 2: Book Of Secrets'`,
  },
  {
    quote: `"Honey? Uh... You wanna know who really killed JFK?"`,
    subquote: `-Stanley Godspeed, 'Rock'`,
  },
  {
    quote: `"You'll be seeing a lot of changes around here. Papa's got a brand new bag."`,
    subquote: `-Castor Troy, 'Face/Off'`,
  },
  {
    quote: `"I'll be taking these Huggies and whatever cash ya got."`,
    subquote: `-H.I., 'Raising Arizona'.`,
  },
  {
    quote: `"People don't throw things at me anymore. Maybe because I carry a bow around."`,
    subquote: `-David Spritz, 'The Weather Man'.`,
  },
];