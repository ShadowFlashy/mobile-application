-- =====================================================================
-- Redline – Season 1 sticker catalogue (48 collectible car models, 8 categories)
-- with body style and country of origin (ISO 3166-1 alpha-2 of the make). Safe to run multiple times.
-- Run after the migrations. The Appendix E catalogue extension lives in seed_collections.sql.
-- =====================================================================
insert into public.car_models (id, sticker_number, make, model, category, rarity, body_style, country, season) values
  ('volkswagen-golf-gti',      1,  'Volkswagen',    'Golf GTI',           'icon',     'common',    'hatchback',   'DE', 1),
  ('mini-cooper-s',            2,  'Mini',          'Cooper S',           'icon',     'common',    'hatchback',   'GB', 1),
  ('abarth-595',               3,  'Abarth',        '595',                'icon',     'common',    'hatchback',   'IT', 1),
  ('land-rover-defender',      4,  'Land Rover',    'Defender',           'icon',     'common',    'suv',         'GB', 1),
  ('range-rover',              5,  'Land Rover',    'Range Rover',        'icon',     'common',    'suv',         'GB', 1),
  ('mercedes-g-class',         6,  'Mercedes-Benz', 'G-Class',            'icon',     'rare',      'suv',         'DE', 1),

  ('porsche-911-gt3',          7,  'Porsche',       '911 GT3',            'sports',   'rare',      'coupe',       'DE', 1),
  ('bmw-m3',                   8,  'BMW',           'M3',                 'sports',   'rare',      'sedan',       'DE', 1),
  ('audi-rs6-avant',           9,  'Audi',          'RS 6 Avant',         'sports',   'rare',      'wagon',       'DE', 1),
  ('mercedes-amg-gt',          10, 'Mercedes-AMG',  'GT',                 'sports',   'rare',      'coupe',       'DE', 1),
  ('alpine-a110',              11, 'Alpine',        'A110',               'sports',   'epic',      'coupe',       'FR', 1),
  ('lotus-emira',              12, 'Lotus',         'Emira',              'sports',   'epic',      'coupe',       'GB', 1),

  ('ferrari-296-gtb',          13, 'Ferrari',       '296 GTB',            'supercar', 'epic',      'supercar',    'IT', 1),
  ('lamborghini-huracan',      14, 'Lamborghini',   'Huracán',            'supercar', 'epic',      'supercar',    'IT', 1),
  ('mclaren-720s',             15, 'McLaren',       '720S',               'supercar', 'epic',      'supercar',    'GB', 1),
  ('audi-r8',                  16, 'Audi',          'R8',                 'supercar', 'rare',      'supercar',    'DE', 1),
  ('aston-martin-vantage',     17, 'Aston Martin',  'Vantage',            'supercar', 'epic',      'coupe',       'GB', 1),
  ('maserati-mc20',            18, 'Maserati',      'MC20',               'supercar', 'epic',      'supercar',    'IT', 1),

  ('bugatti-chiron',           19, 'Bugatti',       'Chiron',             'hypercar', 'legendary', 'supercar',    'FR', 1),
  ('koenigsegg-jesko',         20, 'Koenigsegg',    'Jesko',              'hypercar', 'legendary', 'supercar',    'SE', 1),
  ('pagani-huayra',            21, 'Pagani',        'Huayra',             'hypercar', 'legendary', 'supercar',    'IT', 1),
  ('ferrari-laferrari',        22, 'Ferrari',       'LaFerrari',          'hypercar', 'legendary', 'supercar',    'IT', 1),
  ('porsche-918-spyder',       23, 'Porsche',       '918 Spyder',         'hypercar', 'legendary', 'supercar',    'DE', 1),
  ('mclaren-p1',               24, 'McLaren',       'P1',                 'hypercar', 'legendary', 'supercar',    'GB', 1),

  ('porsche-356',              25, 'Porsche',       '356',                'classic',  'epic',      'coupe',       'DE', 1),
  ('jaguar-e-type',            26, 'Jaguar',        'E-Type',             'classic',  'epic',      'coupe',       'GB', 1),
  ('mercedes-300-sl',          27, 'Mercedes-Benz', '300 SL',             'classic',  'legendary', 'coupe',       'DE', 1),
  ('volkswagen-beetle',        28, 'Volkswagen',    'Beetle',             'classic',  'common',    'coupe',       'DE', 1),
  ('citroen-2cv',              29, 'Citroën',       '2CV',                'classic',  'common',    'sedan',       'FR', 1),
  ('volvo-240',                30, 'Volvo',         '240',                'classic',  'rare',      'sedan',       'SE', 1),

  ('toyota-supra-a80',         31, 'Toyota',        'Supra (A80)',        'jdm',      'epic',      'coupe',       'JP', 1),
  ('nissan-skyline-gt-r-r34',  32, 'Nissan',        'Skyline GT-R (R34)', 'jdm',      'legendary', 'coupe',       'JP', 1),
  ('honda-nsx',                33, 'Honda',         'NSX',                'jdm',      'epic',      'coupe',       'JP', 1),
  ('mazda-mx-5',               34, 'Mazda',         'MX-5',               'jdm',      'common',    'convertible', 'JP', 1),
  ('subaru-impreza-wrx-sti',   35, 'Subaru',        'Impreza WRX STI',    'jdm',      'rare',      'sedan',       'JP', 1),
  ('toyota-gr-yaris',          36, 'Toyota',        'GR Yaris',           'jdm',      'rare',      'hatchback',   'JP', 1),

  ('ford-mustang',             37, 'Ford',          'Mustang',            'muscle',   'rare',      'coupe',       'US', 1),
  ('chevrolet-camaro',         38, 'Chevrolet',     'Camaro',             'muscle',   'rare',      'coupe',       'US', 1),
  ('dodge-challenger',         39, 'Dodge',         'Challenger',         'muscle',   'epic',      'coupe',       'US', 1),
  ('chevrolet-corvette-c8',    40, 'Chevrolet',     'Corvette (C8)',      'muscle',   'epic',      'supercar',    'US', 1),
  ('ford-gt',                  41, 'Ford',          'GT',                 'muscle',   'legendary', 'supercar',    'US', 1),
  ('shelby-cobra',             42, 'Shelby',        'Cobra',              'muscle',   'legendary', 'convertible', 'US', 1),

  ('tesla-model-3',            43, 'Tesla',         'Model 3',            'electric', 'common',    'sedan',       'US', 1),
  ('polestar-2',               44, 'Polestar',      '2',                  'electric', 'common',    'sedan',       'SE', 1),
  ('porsche-taycan',           45, 'Porsche',       'Taycan',             'electric', 'rare',      'sedan',       'DE', 1),
  ('audi-e-tron-gt',           46, 'Audi',          'e-tron GT',          'electric', 'rare',      'sedan',       'DE', 1),
  ('lucid-air',                47, 'Lucid',         'Air',                'electric', 'epic',      'sedan',       'US', 1),
  ('rimac-nevera',             48, 'Rimac',         'Nevera',             'electric', 'legendary', 'supercar',    'HR', 1)
on conflict (id) do update
  set sticker_number = excluded.sticker_number,
      make = excluded.make,
      model = excluded.model,
      category = excluded.category,
      rarity = excluded.rarity,
      body_style = excluded.body_style,
      country = excluded.country,
      season = excluded.season;
