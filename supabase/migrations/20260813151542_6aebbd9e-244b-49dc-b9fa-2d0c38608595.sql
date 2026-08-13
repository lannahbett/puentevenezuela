WITH new_reports AS (
  INSERT INTO public.reports (type, category, title, description, latitude, longitude, location_name, status, urgency, country)
  VALUES
    ('need','water','Agua potable para 40 familias','Barrio sin servicio de acueducto tras el sismo. Se necesitan bidones y agua embotellada.',3.4372,-76.5225,'Cali, Valle del Cauca','pending',5,'CO'),
    ('need','medicine','Medicamentos básicos en albergue','Analgésicos, antibióticos y suero oral para el albergue del coliseo.',2.4448,-76.6147,'Popayán, Cauca','pending',4,'CO'),
    ('need','shelter','Carpas y colchonetas','20 familias durmiendo a la intemperie tras evacuación preventiva.',1.2136,-77.2811,'Pasto, Nariño','in_progress',4,'CO'),
    ('need','rescue','Apoyo para remoción de escombros','Vivienda colapsada parcialmente, se requiere maquinaria ligera y voluntarios.',3.8801,-77.0312,'Buenaventura, Valle del Cauca','pending',5,'CO'),
    ('offer','transport','Camioneta disponible para traslados','Puedo mover insumos entre Cali y Popayán, 1 tonelada, diésel cubierto.',3.4211,-76.5417,'Cali, Valle del Cauca','pending',2,'CO'),
    ('offer','food','200 raciones calientes diarias','Cocina comunitaria lista para entregar almuerzos a albergues del Cauca.',2.4419,-76.6063,'Popayán, Cauca','pending',3,'CO'),
    ('offer','volunteer','Brigada médica voluntaria','Cinco profesionales de salud disponibles fines de semana en Nariño.',1.2058,-77.2772,'Pasto, Nariño','in_progress',3,'CO'),
    ('offer','shelter','Espacio para 15 personas','Salón parroquial habilitado con baños y cocina.',4.8133,-75.6961,'Pereira, Risaralda','pending',2,'CO'),
    ('need','food','Alimentos no perecederos','Familias desplazadas requieren mercados básicos por dos semanas.',4.5389,-75.6725,'Armenia, Quindío','pending',3,'CO'),
    ('offer','water','Tanque cisterna 5.000 litros','Disponible para distribución en zonas sin acueducto del Valle.',3.5391,-76.3025,'Palmira, Valle del Cauca','resolved',2,'CO')
  RETURNING id, title
)
INSERT INTO public.report_items (report_id, label, quantity_needed, quantity_fulfilled)
SELECT id, v.label, v.qty, v.done
FROM new_reports
JOIN (VALUES
  ('Agua potable para 40 familias','Bidones de 20 L',40,12),
  ('Agua potable para 40 familias','Pacas de agua embotellada',60,20),
  ('Medicamentos básicos en albergue','Cajas de analgésicos',30,5),
  ('Medicamentos básicos en albergue','Sobres de suero oral',200,50),
  ('Carpas y colchonetas','Carpas familiares',20,8),
  ('Carpas y colchonetas','Colchonetas',60,25),
  ('Alimentos no perecederos','Mercados básicos',50,10)
) AS v(title,label,qty,done) ON v.title = new_reports.title;