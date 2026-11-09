-- =====================================================================
-- Redline – sticker catalogue (48 collectible car models, 8 categories)
-- Safe to run multiple times.
-- =====================================================================
insert into public.car_models (id, sticker_number, make, model, category, rarity) values
  ('volkswagen-golf-gti',        1, 'Volkswagen',    'Golf GTI',          'icon',     'common'),
  ('mini-cooper-s',              2, 'Mini',          'Cooper S',          'icon',     'common'),
  ('abarth-595',                 3, 'Abarth',        '595',               'icon',     'common'),
  ('land-rover-defender',        4, 'Land Rover',    'Defender',          'icon',     'common'),
  ('range-rover',                5, 'Land Rover',    'Range Rover',       'icon',     'common'),
  ('mercedes-g-class',           6, 'Mercedes-Benz', 'G-Class',           'icon',     'rare'),

  ('porsche-911-gt3',            7, 'Porsche',       '911 GT3',           'sports',   'rare'),
  ('bmw-m3',                     8, 'BMW',           'M3',                'sports',   'rare'),
  ('audi-rs6-avant',             9, 'Audi',          'RS 6 Avant',        'sports',   'rare'),
  ('mercedes-amg-gt',           10, 'Mercedes-AMG',  'GT',                'sports',   'rare'),
  ('alpine-a110',               11, 'Alpine',        'A110',              'sports',   'epic'),
  ('lotus-emira',               12, 'Lotus',         'Emira',             'sports',   'epic'),

  ('ferrari-296-gtb',           13, 'Ferrari',       '296 GTB',           'supercar', 'epic'),
  ('lamborghini-huracan',       14, 'Lamborghini',   'Huracán',           'supercar', 'epic'),
  ('mclaren-720s',              15, 'McLaren',       '720S',              'supercar', 'epic'),
  ('audi-r8',                   16, 'Audi',          'R8',                'supercar', 'rare'),
  ('aston-martin-vantage',      17, 'Aston Martin',  'Vantage',           'supercar', 'epic'),
  ('maserati-mc20',             18, 'Maserati',      'MC20',              'supercar', 'epic'),

  ('bugatti-chiron',            19, 'Bugatti',       'Chiron',            'hypercar', 'legendary'),
  ('koenigsegg-jesko',          20, 'Koenigsegg',    'Jesko',             'hypercar', 'legendary'),
  ('pagani-huayra',             21, 'Pagani',        'Huayra',            'hypercar', 'legendary'),
  ('ferrari-laferrari',         22, 'Ferrari',       'LaFerrari',         'hypercar', 'legendary'),
  ('porsche-918-spyder',        23, 'Porsche',       '918 Spyder',        'hypercar', 'legendary'),
  ('mclaren-p1',                24, 'McLaren',       'P1',                'hypercar', 'legendary'),

  ('porsche-356',               25, 'Porsche',       '356',               'classic',  'epic'),
  ('jaguar-e-type',             26, 'Jaguar',        'E-Type',            'classic',  'epic'),
  ('mercedes-300-sl',           27, 'Mercedes-Benz', '300 SL',            'classic',  'legendary'),
  ('volkswagen-beetle',         28, 'Volkswagen',    'Beetle',            'classic',  'common'),
  ('citroen-2cv',               29, 'Citroën',       '2CV',               'classic',  'common'),
  ('volvo-240',                 30, 'Volvo',         '240',               'classic',  'rare'),

  ('toyota-supra-a80',          31, 'Toyota',        'Supra (A80)',       'jdm',      'epic'),
  ('nissan-skyline-gt-r-r34',   32, 'Nissan',        'Skyline GT-R (R34)','jdm',      'legendary'),
  ('honda-nsx',                 33, 'Honda',         'NSX',               'jdm',      'epic'),
  ('mazda-mx-5',                34, 'Mazda',         'MX-5',              'jdm',      'common'),
  ('subaru-impreza-wrx-sti',    35, 'Subaru',        'Impreza WRX STI',   'jdm',      'rare'),
  ('toyota-gr-yaris',           36, 'Toyota',        'GR Yaris',          'jdm',      'rare'),

  ('ford-mustang',              37, 'Ford',          'Mustang',           'muscle',   'rare'),
  ('chevrolet-camaro',          38, 'Chevrolet',     'Camaro',            'muscle',   'rare'),
  ('dodge-challenger',          39, 'Dodge',         'Challenger',        'muscle',   'epic'),
  ('chevrolet-corvette-c8',     40, 'Chevrolet',     'Corvette (C8)',     'muscle',   'epic'),
  ('ford-gt',                   41, 'Ford',          'GT',                'muscle',   'legendary'),
  ('shelby-cobra',              42, 'Shelby',        'Cobra',             'muscle',   'legendary'),

  ('tesla-model-3',             43, 'Tesla',         'Model 3',           'electric', 'common'),
  ('polestar-2',                44, 'Polestar',      '2',                 'electric', 'common'),
  ('porsche-taycan',            45, 'Porsche',       'Taycan',            'electric', 'rare'),
  ('audi-e-tron-gt',            46, 'Audi',          'e-tron GT',         'electric', 'rare'),
  ('lucid-air',                 47, 'Lucid',         'Air',               'electric', 'epic'),
  ('rimac-nevera',              48, 'Rimac',         'Nevera',            'electric', 'legendary')
on conflict (id) do update
  set sticker_number = excluded.sticker_number,
      make = excluded.make,
      model = excluded.model,
      category = excluded.category,
      rarity = excluded.rarity;
