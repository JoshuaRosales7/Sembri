-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all plots" ON public.plots;
DROP POLICY IF EXISTS "Admins can view all satellite data" ON public.satellite_data;
DROP POLICY IF EXISTS "Admins can view all loans" ON public.loans;
DROP POLICY IF EXISTS "Admins can update all loans" ON public.loans;
DROP POLICY IF EXISTS "Admins can insert inputs" ON public.inputs;
DROP POLICY IF EXISTS "Admins can update inputs" ON public.inputs;
DROP POLICY IF EXISTS "Admins can view all loan inputs" ON public.loan_inputs;
DROP POLICY IF EXISTS "Admins can insert loan inputs" ON public.loan_inputs;
DROP POLICY IF EXISTS "Admins can insert recommendations" ON public.recommendations;

-- Create a function to check if user is admin (avoids recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate admin policies using the function for non-profiles tables
-- For profiles table, use a simpler approach
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
  );

-- Plots policies
CREATE POLICY "Admins can view all plots"
  ON public.plots FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can manage all plots"
  ON public.plots FOR ALL
  USING (public.is_admin());

-- Satellite data policies
CREATE POLICY "Admins can view all satellite data"
  ON public.satellite_data FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can manage satellite data"
  ON public.satellite_data FOR ALL
  USING (public.is_admin());

-- Loans policies
CREATE POLICY "Admins can view all loans"
  ON public.loans FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update all loans"
  ON public.loans FOR UPDATE
  USING (public.is_admin());

-- Inputs policies
CREATE POLICY "Admins can insert inputs"
  ON public.inputs FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update inputs"
  ON public.inputs FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete inputs"
  ON public.inputs FOR DELETE
  USING (public.is_admin());

-- Loan inputs policies
CREATE POLICY "Admins can view all loan inputs"
  ON public.loan_inputs FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can insert loan inputs"
  ON public.loan_inputs FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can manage loan inputs"
  ON public.loan_inputs FOR ALL
  USING (public.is_admin());

-- Recommendations policies
CREATE POLICY "Admins can insert recommendations"
  ON public.recommendations FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can manage recommendations"
  ON public.recommendations FOR ALL
  USING (public.is_admin());
