-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Farmers can view their own plots" ON public.plots;
DROP POLICY IF EXISTS "Farmers can insert their own plots" ON public.plots;
DROP POLICY IF EXISTS "Farmers can update their own plots" ON public.plots;
DROP POLICY IF EXISTS "Farmers can delete their own plots" ON public.plots;
DROP POLICY IF EXISTS "Admins can view all plots" ON public.plots;
DROP POLICY IF EXISTS "Farmers can view satellite data for their plots" ON public.satellite_data;
DROP POLICY IF EXISTS "Admins can view all satellite data" ON public.satellite_data;
DROP POLICY IF EXISTS "Farmers can view their own loans" ON public.loans;
DROP POLICY IF EXISTS "Farmers can insert their own loan applications" ON public.loans;
DROP POLICY IF EXISTS "Admins can view all loans" ON public.loans;
DROP POLICY IF EXISTS "Admins can update all loans" ON public.loans;
DROP POLICY IF EXISTS "Anyone can view inputs" ON public.inputs;
DROP POLICY IF EXISTS "Admins can insert inputs" ON public.inputs;
DROP POLICY IF EXISTS "Admins can update inputs" ON public.inputs;
DROP POLICY IF EXISTS "Farmers can view loan inputs for their loans" ON public.loan_inputs;
DROP POLICY IF EXISTS "Admins can view all loan inputs" ON public.loan_inputs;
DROP POLICY IF EXISTS "Admins can insert loan inputs" ON public.loan_inputs;
DROP POLICY IF EXISTS "Farmers can view recommendations for their plots" ON public.recommendations;
DROP POLICY IF EXISTS "Farmers can update recommendations for their plots" ON public.recommendations;
DROP POLICY IF EXISTS "Admins can insert recommendations" ON public.recommendations;

-- Create a security definer function to check if user is admin
-- This function bypasses RLS to avoid recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles policies (simplified to avoid recursion)
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- For admin access to profiles, we'll handle it in the application layer
-- to avoid recursion issues

-- Plots policies
CREATE POLICY "Farmers view own plots"
  ON public.plots FOR SELECT
  USING (farmer_id = auth.uid() OR public.is_admin());

CREATE POLICY "Farmers insert own plots"
  ON public.plots FOR INSERT
  WITH CHECK (farmer_id = auth.uid());

CREATE POLICY "Farmers update own plots"
  ON public.plots FOR UPDATE
  USING (farmer_id = auth.uid() OR public.is_admin());

CREATE POLICY "Farmers delete own plots"
  ON public.plots FOR DELETE
  USING (farmer_id = auth.uid() OR public.is_admin());

-- Satellite data policies
CREATE POLICY "View satellite data"
  ON public.satellite_data FOR SELECT
  USING (
    public.is_admin() OR
    EXISTS (
      SELECT 1 FROM public.plots
      WHERE plots.id = satellite_data.plot_id
      AND plots.farmer_id = auth.uid()
    )
  );

CREATE POLICY "Insert satellite data"
  ON public.satellite_data FOR INSERT
  WITH CHECK (public.is_admin());

-- Loans policies
CREATE POLICY "View loans"
  ON public.loans FOR SELECT
  USING (farmer_id = auth.uid() OR public.is_admin());

CREATE POLICY "Insert loan applications"
  ON public.loans FOR INSERT
  WITH CHECK (farmer_id = auth.uid());

CREATE POLICY "Update loans"
  ON public.loans FOR UPDATE
  USING (farmer_id = auth.uid() OR public.is_admin());

-- Inputs policies (public read, admin write)
CREATE POLICY "View inputs"
  ON public.inputs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Insert inputs"
  ON public.inputs FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Update inputs"
  ON public.inputs FOR UPDATE
  USING (public.is_admin());

-- Loan inputs policies
CREATE POLICY "View loan inputs"
  ON public.loan_inputs FOR SELECT
  USING (
    public.is_admin() OR
    EXISTS (
      SELECT 1 FROM public.loans
      WHERE loans.id = loan_inputs.loan_id
      AND loans.farmer_id = auth.uid()
    )
  );

CREATE POLICY "Insert loan inputs"
  ON public.loan_inputs FOR INSERT
  WITH CHECK (public.is_admin() OR
    EXISTS (
      SELECT 1 FROM public.loans
      WHERE loans.id = loan_inputs.loan_id
      AND loans.farmer_id = auth.uid()
    )
  );

-- Recommendations policies
CREATE POLICY "View recommendations"
  ON public.recommendations FOR SELECT
  USING (
    public.is_admin() OR
    EXISTS (
      SELECT 1 FROM public.plots
      WHERE plots.id = recommendations.plot_id
      AND plots.farmer_id = auth.uid()
    )
  );

CREATE POLICY "Update recommendations"
  ON public.recommendations FOR UPDATE
  USING (
    public.is_admin() OR
    EXISTS (
      SELECT 1 FROM public.plots
      WHERE plots.id = recommendations.plot_id
      AND plots.farmer_id = auth.uid()
    )
  );

CREATE POLICY "Insert recommendations"
  ON public.recommendations FOR INSERT
  WITH CHECK (public.is_admin());
