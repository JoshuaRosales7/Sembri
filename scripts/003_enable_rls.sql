-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.satellite_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Plots policies
CREATE POLICY "Farmers can view their own plots"
  ON public.plots FOR SELECT
  USING (farmer_id = auth.uid());

CREATE POLICY "Farmers can insert their own plots"
  ON public.plots FOR INSERT
  WITH CHECK (farmer_id = auth.uid());

CREATE POLICY "Farmers can update their own plots"
  ON public.plots FOR UPDATE
  USING (farmer_id = auth.uid());

CREATE POLICY "Farmers can delete their own plots"
  ON public.plots FOR DELETE
  USING (farmer_id = auth.uid());

CREATE POLICY "Admins can view all plots"
  ON public.plots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Satellite data policies
CREATE POLICY "Farmers can view satellite data for their plots"
  ON public.satellite_data FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.plots
      WHERE plots.id = satellite_data.plot_id
      AND plots.farmer_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all satellite data"
  ON public.satellite_data FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Loans policies
CREATE POLICY "Farmers can view their own loans"
  ON public.loans FOR SELECT
  USING (farmer_id = auth.uid());

CREATE POLICY "Farmers can insert their own loan applications"
  ON public.loans FOR INSERT
  WITH CHECK (farmer_id = auth.uid());

CREATE POLICY "Admins can view all loans"
  ON public.loans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all loans"
  ON public.loans FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Inputs policies (public read, admin write)
CREATE POLICY "Anyone can view inputs"
  ON public.inputs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert inputs"
  ON public.inputs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update inputs"
  ON public.inputs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Loan inputs policies
CREATE POLICY "Farmers can view loan inputs for their loans"
  ON public.loan_inputs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.loans
      WHERE loans.id = loan_inputs.loan_id
      AND loans.farmer_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all loan inputs"
  ON public.loan_inputs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert loan inputs"
  ON public.loan_inputs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Recommendations policies
CREATE POLICY "Farmers can view recommendations for their plots"
  ON public.recommendations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.plots
      WHERE plots.id = recommendations.plot_id
      AND plots.farmer_id = auth.uid()
    )
  );

CREATE POLICY "Farmers can update recommendations for their plots"
  ON public.recommendations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.plots
      WHERE plots.id = recommendations.plot_id
      AND plots.farmer_id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert recommendations"
  ON public.recommendations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
