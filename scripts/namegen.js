
namegen = {}

namegen.name = function() {
  var r = function(min,max) { return Math.floor(Math.random() * (max - min + 1) + min) }
  var g = function(list)    { return list[r(0, list.length - 1)] }

  return g(namegen.firsts) + '-' + g(namegen.lasts)
}

namegen.firsts = [
  'adorable',
  'agreeable',
  'amazing',
  'ancient',
  'artistic',
  'belligerent',
  'brainy',
  'capricious',
  'chemical',
  'competitive',
  'confused',
  'dainty',
  'dangerous',
  'daring',
  'delightful',
  'earthy',
  'envious',
  'fanciful',
  'flatulent',
  'genius',
  'glamorous',
  'gleeful',
  'groovy',
  'handsome',
  'heady',
  'hilarious',
  'hypnotic',
  'incredible',
  'inexpensive',
  'inquisitive',
  'intelligent',
  'jazzy',
  'juicy',
  'keen',
  'kind',
  'lamentable',
  'lonely',
  'luxuriant',
  'macabre',
  'macho',
  'majestic',
  'marvelous',
  'musical',
  'mysterious',
  'necessary',
  'needy',
  'nonstop',
  'opulent',
  'overconfident',
  'pastoral',
  'penitent',
  'purposeful',
  'quaint',
  'reckless',
  'rich',
  'scientific',
  'sonorous',
  'soporific',
  'tantalising',
  'tepid',
  'treacherous',
  'uptight',
  'vain',
  'winsome'
]

namegen.lasts = [
  'antelope',
  'armadillo',
  'axolotl',
  'banana',
  'bat',
  'bee',
  'capybara',
  'cat',
  'cuttlefish',
  'dodo',
  'dolphin',
  'dotterel',
  'echidna',
  'elephant',
  'fox',
  'giraffe',
  'gnu',
  'goldfish',
  'gorilla',
  'grouse',
  'hamster',
  'herring',
  'hyena',
  'ibex',
  'impala',
  'jaguar',
  'kouprey',
  'lemur',
  'llama',
  'meerkat',
  'narwhal',
  'ocelot',
  'osprey',
  'penguin',
  'pika',
  'porpoise',
  'quokka',
  'raccoon',
  'raven',
  'reindeer',
  'scorpion',
  'serval',
  'shark',
  'sheep',
  'stallion',
  'toucan',
  'walrus',
  'weasel',
  'wombat',
  'zebra',
]
