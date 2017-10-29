import { loadSound } from './Audio';

const assets = [
  'audio/weapon-fire.mp3',
  'audio/ship-explosion.mp3',
  'audio/pause-game.mp3'
]

let allAssets = assets.map(loadSound);

export default Promise.all(allAssets);
