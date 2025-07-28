-- Agregar columnas de ofertas del anfitrión a la tabla topes
ALTER TABLE public.topes 
ADD COLUMN ofrece_hospedaje BOOLEAN DEFAULT false,
ADD COLUMN ofrece_comida BOOLEAN DEFAULT false,
ADD COLUMN ofrece_transporte BOOLEAN DEFAULT false,
ADD COLUMN ofrece_otros TEXT;

-- Agregar comentarios para documentar las nuevas columnas
COMMENT ON COLUMN public.topes.ofrece_hospedaje IS 'Indica si el anfitrión ofrece hospedaje a los visitantes';
COMMENT ON COLUMN public.topes.ofrece_comida IS 'Indica si el anfitrión ofrece comida a los visitantes';
COMMENT ON COLUMN public.topes.ofrece_transporte IS 'Indica si el anfitrión ofrece transporte a los visitantes';
COMMENT ON COLUMN public.topes.ofrece_otros IS 'Descripción de otras ofertas del anfitrión (hidratación, snacks, etc.)'; 