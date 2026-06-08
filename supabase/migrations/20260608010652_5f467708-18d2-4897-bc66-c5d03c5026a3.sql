
-- 1. DCIM Adapters: split policies, admin-only updates
DROP POLICY IF EXISTS "Users can manage adapters" ON public.dcim_adapters;

CREATE POLICY "Site owners can view adapters"
ON public.dcim_adapters FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.dcim_sites s WHERE s.id = dcim_adapters.site_id AND s.user_id = auth.uid()));

CREATE POLICY "Site owners can insert adapters"
ON public.dcim_adapters FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.dcim_sites s WHERE s.id = dcim_adapters.site_id AND s.user_id = auth.uid()));

CREATE POLICY "Site owners can delete adapters"
ON public.dcim_adapters FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.dcim_sites s WHERE s.id = dcim_adapters.site_id AND s.user_id = auth.uid()));

CREATE POLICY "Admins can update adapter credentials"
ON public.dcim_adapters FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. DCIM Network Links: require ownership of BOTH source and target
DROP POLICY IF EXISTS "Users can manage network_links" ON public.dcim_network_links;

CREATE POLICY "Users can manage network_links with both endpoints owned"
ON public.dcim_network_links FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.dcim_nodes n
    JOIN public.dcim_racks ra ON n.rack_id = ra.id
    JOIN public.dcim_rows ro ON ra.row_id = ro.id
    JOIN public.dcim_rooms rm ON ro.room_id = rm.id
    JOIN public.dcim_sites s ON rm.site_id = s.id
    WHERE n.id = dcim_network_links.source_node_id AND s.user_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM public.dcim_nodes n
    JOIN public.dcim_racks ra ON n.rack_id = ra.id
    JOIN public.dcim_rows ro ON ra.row_id = ro.id
    JOIN public.dcim_rooms rm ON ro.room_id = rm.id
    JOIN public.dcim_sites s ON rm.site_id = s.id
    WHERE n.id = dcim_network_links.target_node_id AND s.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.dcim_nodes n
    JOIN public.dcim_racks ra ON n.rack_id = ra.id
    JOIN public.dcim_rows ro ON ra.row_id = ro.id
    JOIN public.dcim_rooms rm ON ro.room_id = rm.id
    JOIN public.dcim_sites s ON rm.site_id = s.id
    WHERE n.id = dcim_network_links.source_node_id AND s.user_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM public.dcim_nodes n
    JOIN public.dcim_racks ra ON n.rack_id = ra.id
    JOIN public.dcim_rows ro ON ra.row_id = ro.id
    JOIN public.dcim_rooms rm ON ro.room_id = rm.id
    JOIN public.dcim_sites s ON rm.site_id = s.id
    WHERE n.id = dcim_network_links.target_node_id AND s.user_id = auth.uid()
  )
);

-- 3. Remove user-scoped sensitive tables from Realtime publication
ALTER PUBLICATION supabase_realtime DROP TABLE public.raw_telemetry;
ALTER PUBLICATION supabase_realtime DROP TABLE public.processed_metrics;
ALTER PUBLICATION supabase_realtime DROP TABLE public.recommendations;
ALTER PUBLICATION supabase_realtime DROP TABLE public.dc_telemetry;
ALTER PUBLICATION supabase_realtime DROP TABLE public.dcim_telemetry;
ALTER PUBLICATION supabase_realtime DROP TABLE public.dcim_events;
ALTER PUBLICATION supabase_realtime DROP TABLE public.dcim_agent_recommendations;
