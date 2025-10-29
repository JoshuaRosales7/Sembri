-- 🌱 Semillas, fertilizantes, agroquímicos y herramientas agrícolas comunes en Guatemala
-- Inserta datos iniciales de insumos agrícolas (evita duplicados si ya existen)

INSERT INTO public.inputs (name, category, unit_price, unit, description) VALUES
  -- 🌽 Semillas
  ('Semilla de Maíz Híbrido INTA', 'semilla', 145.00, 'kg', 'Semilla híbrida de alto rendimiento, resistente a sequía y plagas'),
  ('Semilla de Frijol Negro ICTA Ligero', 'semilla', 95.00, 'kg', 'Variedad nacional adaptada al clima guatemalteco, alto rendimiento'),
  ('Semilla de Arroz Palmar 18', 'semilla', 120.00, 'kg', 'Semilla certificada con buen rendimiento en zonas bajas'),
  ('Semilla de Tomate Roma', 'semilla', 220.00, 'kg', 'Semilla de tomate tipo Roma, ideal para industria y consumo fresco'),
  ('Semilla de Chile Jalapeño', 'semilla', 250.00, 'kg', 'Semilla mejorada con buena resistencia y alto contenido de capsaicina'),

  -- 🌿 Fertilizantes
  ('Fertilizante NPK 15-15-15', 'fertilizante', 82.00, 'kg', 'Fertilizante completo con nitrógeno, fósforo y potasio balanceados'),
  ('Fertilizante Urea 46%', 'fertilizante', 60.00, 'kg', 'Alta concentración de nitrógeno, ideal para maíz y pastos'),
  ('Sulfato de Amonio', 'fertilizante', 55.00, 'kg', 'Fertilizante nitrogenado con azufre, mejora el crecimiento foliar'),
  ('Fosfato Diamónico (DAP)', 'fertilizante', 85.00, 'kg', 'Fuente concentrada de fósforo y nitrógeno para cultivos básicos'),
  ('Cal agrícola', 'fertilizante', 20.00, 'kg', 'Reduce la acidez del suelo y mejora la absorción de nutrientes'),

  -- 🐛 Pesticidas y plaguicidas
  ('Insecticida Lambda-Cyhalotrina', 'pesticida', 28.00, 'litro', 'Control de insectos chupadores y masticadores en maíz, frijol y hortalizas'),
  ('Insecticida Imidacloprid', 'pesticida', 35.00, 'litro', 'Insecticida sistémico de amplio espectro'),
  ('Fungicida Mancozeb', 'pesticida', 40.00, 'kg', 'Control preventivo de hongos en cultivos de hoja y fruta'),
  ('Fungicida Clorotalonil', 'pesticida', 38.00, 'litro', 'Fungicida de contacto para enfermedades foliares'),

  -- 🌾 Herbicidas
  ('Herbicida Glifosato', 'pesticida', 32.00, 'litro', 'Herbicida no selectivo para control de malezas perennes'),
  ('Herbicida Atrazina', 'pesticida', 28.00, 'kg', 'Control de malezas de hoja ancha en cultivos de maíz y sorgo'),

  -- ⚙️ Herramientas manuales
  ('Azadón', 'equipo', 18.00, 'pieza', 'Herramienta básica para cultivo y preparación del suelo'),
  ('Machete', 'equipo', 25.00, 'pieza', 'Corte de maleza y labores de campo'),
  ('Pala', 'equipo', 35.00, 'pieza', 'Para excavación y mezcla de abonos'),
  ('Rastrillo Metálico', 'equipo', 40.00, 'pieza', 'Nivelación y limpieza del terreno'),

  -- 🚜 Equipos agrícolas
  ('Bomba de mochila 16L', 'equipo', 260.00, 'pieza', 'Aspersora manual para aplicación de agroquímicos'),
  ('Bomba de riego portátil', 'equipo', 520.00, 'pieza', 'Bomba de agua de pequeña escala, ideal para riego por manguera'),
  ('Sistema de riego por goteo básico', 'equipo', 1200.00, 'kit', 'Sistema eficiente para riego controlado en cultivos de hortalizas'),
  ('Tractor pequeño (alquiler por día)', 'equipo', 850.00, 'día', 'Equipo mecanizado para arado y preparación del terreno'),

  -- 💧 Insumos complementarios
  ('Plástico para acolchado agrícola', 'insumo', 45.00, 'metro', 'Conserva humedad y controla malezas en cultivos de hortalizas'),
  ('Manguera de riego 1/2”', 'insumo', 25.00, 'metro', 'Para sistemas de riego por gravedad o bombeo'),
  ('Bolsas para vivero 6x8', 'insumo', 0.50, 'unidad', 'Usadas para almácigos de café, cacao, hortalizas y árboles frutales')
ON CONFLICT DO NOTHING;
