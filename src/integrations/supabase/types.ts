export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      accelerator_specs: {
        Row: {
          arch: string | null
          created_at: string | null
          id: string
          mem_bandwidth_gbps: number | null
          memory_gb: number
          model: string
          peak_fp16_tflops: number | null
          tdp_w: number
          updated_at: string | null
          vendor: string
        }
        Insert: {
          arch?: string | null
          created_at?: string | null
          id?: string
          mem_bandwidth_gbps?: number | null
          memory_gb: number
          model: string
          peak_fp16_tflops?: number | null
          tdp_w: number
          updated_at?: string | null
          vendor: string
        }
        Update: {
          arch?: string | null
          created_at?: string | null
          id?: string
          mem_bandwidth_gbps?: number | null
          memory_gb?: number
          model?: string
          peak_fp16_tflops?: number | null
          tdp_w?: number
          updated_at?: string | null
          vendor?: string
        }
        Relationships: []
      }
      benchmarks: {
        Row: {
          accelerator_id: string | null
          avg_power_w_per_device: number | null
          batch_size: number | null
          created_at: string | null
          energy_kwh_total: number | null
          id: string
          model_name: string
          precision: string | null
          tokens_per_second: number | null
          workload_type: string
        }
        Insert: {
          accelerator_id?: string | null
          avg_power_w_per_device?: number | null
          batch_size?: number | null
          created_at?: string | null
          energy_kwh_total?: number | null
          id?: string
          model_name: string
          precision?: string | null
          tokens_per_second?: number | null
          workload_type: string
        }
        Update: {
          accelerator_id?: string | null
          avg_power_w_per_device?: number | null
          batch_size?: number | null
          created_at?: string | null
          energy_kwh_total?: number | null
          id?: string
          model_name?: string
          precision?: string | null
          tokens_per_second?: number | null
          workload_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "benchmarks_accelerator_id_fkey"
            columns: ["accelerator_id"]
            isOneToOne: false
            referencedRelation: "accelerator_specs"
            referencedColumns: ["id"]
          },
        ]
      }
      dc_endpoints: {
        Row: {
          api_key: string | null
          created_at: string
          id: string
          last_ping: string | null
          metadata: Json | null
          name: string
          status: string
          type: string
          updated_at: string
          url: string
        }
        Insert: {
          api_key?: string | null
          created_at?: string
          id?: string
          last_ping?: string | null
          metadata?: Json | null
          name: string
          status?: string
          type: string
          updated_at?: string
          url: string
        }
        Update: {
          api_key?: string | null
          created_at?: string
          id?: string
          last_ping?: string | null
          metadata?: Json | null
          name?: string
          status?: string
          type?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      dc_telemetry: {
        Row: {
          created_at: string
          endpoint_id: string | null
          endpoint_name: string
          endpoint_type: string
          flow_lpm: number | null
          id: string
          leak_status: string | null
          load_kw: number | null
          power_factor: number | null
          power_w: number | null
          pressure_bar: number | null
          raw_data: Json | null
          temperature_c: number | null
          utilization_pct: number | null
          voltage_v: number | null
        }
        Insert: {
          created_at?: string
          endpoint_id?: string | null
          endpoint_name: string
          endpoint_type: string
          flow_lpm?: number | null
          id?: string
          leak_status?: string | null
          load_kw?: number | null
          power_factor?: number | null
          power_w?: number | null
          pressure_bar?: number | null
          raw_data?: Json | null
          temperature_c?: number | null
          utilization_pct?: number | null
          voltage_v?: number | null
        }
        Update: {
          created_at?: string
          endpoint_id?: string | null
          endpoint_name?: string
          endpoint_type?: string
          flow_lpm?: number | null
          id?: string
          leak_status?: string | null
          load_kw?: number | null
          power_factor?: number | null
          power_w?: number | null
          pressure_bar?: number | null
          raw_data?: Json | null
          temperature_c?: number | null
          utilization_pct?: number | null
          voltage_v?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dc_telemetry_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "dc_endpoints"
            referencedColumns: ["id"]
          },
        ]
      }
      dcim_accelerators: {
        Row: {
          accelerator_type: string
          created_at: string
          driver_version: string | null
          firmware_version: string | null
          id: string
          manufacturer: string | null
          memory_gb: number | null
          model: string | null
          node_id: string
          serial_number: string | null
          slot_position: number | null
          status: string | null
          tdp_w: number | null
        }
        Insert: {
          accelerator_type: string
          created_at?: string
          driver_version?: string | null
          firmware_version?: string | null
          id?: string
          manufacturer?: string | null
          memory_gb?: number | null
          model?: string | null
          node_id: string
          serial_number?: string | null
          slot_position?: number | null
          status?: string | null
          tdp_w?: number | null
        }
        Update: {
          accelerator_type?: string
          created_at?: string
          driver_version?: string | null
          firmware_version?: string | null
          id?: string
          manufacturer?: string | null
          memory_gb?: number | null
          model?: string | null
          node_id?: string
          serial_number?: string | null
          slot_position?: number | null
          status?: string | null
          tdp_w?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dcim_accelerators_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "dcim_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      dcim_adapters: {
        Row: {
          adapter_type: string
          auth_type: string | null
          capabilities: Json | null
          capability_tier: string | null
          created_at: string
          credentials_ref: string | null
          endpoint_url: string | null
          health_status: string | null
          id: string
          is_active: boolean | null
          last_health_check: string | null
          metadata: Json | null
          name: string
          provider: string | null
          rate_limits: Json | null
          site_id: string
        }
        Insert: {
          adapter_type: string
          auth_type?: string | null
          capabilities?: Json | null
          capability_tier?: string | null
          created_at?: string
          credentials_ref?: string | null
          endpoint_url?: string | null
          health_status?: string | null
          id?: string
          is_active?: boolean | null
          last_health_check?: string | null
          metadata?: Json | null
          name: string
          provider?: string | null
          rate_limits?: Json | null
          site_id: string
        }
        Update: {
          adapter_type?: string
          auth_type?: string | null
          capabilities?: Json | null
          capability_tier?: string | null
          created_at?: string
          credentials_ref?: string | null
          endpoint_url?: string | null
          health_status?: string | null
          id?: string
          is_active?: boolean | null
          last_health_check?: string | null
          metadata?: Json | null
          name?: string
          provider?: string | null
          rate_limits?: Json | null
          site_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dcim_adapters_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "dcim_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      dcim_agent_recommendations: {
        Row: {
          action_payload: Json | null
          action_type: string | null
          affected_entities: string[] | null
          agent_type: string
          approved_at: string | null
          approved_by: string | null
          created_at: string
          description: string | null
          estimated_improvement: Json | null
          evidence: Json | null
          executed_at: string | null
          id: string
          impact_scope: string | null
          priority: string | null
          reasoning: string | null
          rolled_back: boolean | null
          rolled_back_at: string | null
          site_id: string
          status: string | null
          title: string
          verification_result: Json | null
          verified_at: string | null
        }
        Insert: {
          action_payload?: Json | null
          action_type?: string | null
          affected_entities?: string[] | null
          agent_type: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          description?: string | null
          estimated_improvement?: Json | null
          evidence?: Json | null
          executed_at?: string | null
          id?: string
          impact_scope?: string | null
          priority?: string | null
          reasoning?: string | null
          rolled_back?: boolean | null
          rolled_back_at?: string | null
          site_id: string
          status?: string | null
          title: string
          verification_result?: Json | null
          verified_at?: string | null
        }
        Update: {
          action_payload?: Json | null
          action_type?: string | null
          affected_entities?: string[] | null
          agent_type?: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          description?: string | null
          estimated_improvement?: Json | null
          evidence?: Json | null
          executed_at?: string | null
          id?: string
          impact_scope?: string | null
          priority?: string | null
          reasoning?: string | null
          rolled_back?: boolean | null
          rolled_back_at?: string | null
          site_id?: string
          status?: string | null
          title?: string
          verification_result?: Json | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dcim_agent_recommendations_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "dcim_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      dcim_cooling_equipment: {
        Row: {
          capacity_kw: number | null
          created_at: string
          equipment_type: string
          id: string
          manufacturer: string | null
          model: string | null
          name: string
          room_id: string | null
          setpoint_c: number | null
          status: string | null
        }
        Insert: {
          capacity_kw?: number | null
          created_at?: string
          equipment_type: string
          id?: string
          manufacturer?: string | null
          model?: string | null
          name: string
          room_id?: string | null
          setpoint_c?: number | null
          status?: string | null
        }
        Update: {
          capacity_kw?: number | null
          created_at?: string
          equipment_type?: string
          id?: string
          manufacturer?: string | null
          model?: string | null
          name?: string
          room_id?: string | null
          setpoint_c?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dcim_cooling_equipment_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "dcim_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      dcim_events: {
        Row: {
          acknowledged: boolean | null
          acknowledged_by: string | null
          created_at: string
          description: string | null
          entity_id: string | null
          entity_type: string | null
          event_type: string
          id: string
          metadata: Json | null
          resolved: boolean | null
          resolved_at: string | null
          severity: string | null
          site_id: string
          source: string | null
          title: string
        }
        Insert: {
          acknowledged?: boolean | null
          acknowledged_by?: string | null
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          resolved?: boolean | null
          resolved_at?: string | null
          severity?: string | null
          site_id: string
          source?: string | null
          title: string
        }
        Update: {
          acknowledged?: boolean | null
          acknowledged_by?: string | null
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          resolved?: boolean | null
          resolved_at?: string | null
          severity?: string | null
          site_id?: string
          source?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "dcim_events_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "dcim_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      dcim_network_links: {
        Row: {
          created_at: string
          id: string
          link_type: string | null
          source_node_id: string | null
          source_port: string | null
          speed_gbps: number | null
          status: string | null
          target_node_id: string | null
          target_port: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          link_type?: string | null
          source_node_id?: string | null
          source_port?: string | null
          speed_gbps?: number | null
          status?: string | null
          target_node_id?: string | null
          target_port?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          link_type?: string | null
          source_node_id?: string | null
          source_port?: string | null
          speed_gbps?: number | null
          status?: string | null
          target_node_id?: string | null
          target_port?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dcim_network_links_source_node_id_fkey"
            columns: ["source_node_id"]
            isOneToOne: false
            referencedRelation: "dcim_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dcim_network_links_target_node_id_fkey"
            columns: ["target_node_id"]
            isOneToOne: false
            referencedRelation: "dcim_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      dcim_nodes: {
        Row: {
          created_at: string
          driver_version: string | null
          firmware_version: string | null
          id: string
          last_seen_at: string | null
          manufacturer: string | null
          metadata: Json | null
          model: string | null
          name: string
          node_type: string
          power_rating_w: number | null
          rack_id: string
          serial_number: string | null
          status: string | null
          u_height: number | null
          u_position: number | null
        }
        Insert: {
          created_at?: string
          driver_version?: string | null
          firmware_version?: string | null
          id?: string
          last_seen_at?: string | null
          manufacturer?: string | null
          metadata?: Json | null
          model?: string | null
          name: string
          node_type: string
          power_rating_w?: number | null
          rack_id: string
          serial_number?: string | null
          status?: string | null
          u_height?: number | null
          u_position?: number | null
        }
        Update: {
          created_at?: string
          driver_version?: string | null
          firmware_version?: string | null
          id?: string
          last_seen_at?: string | null
          manufacturer?: string | null
          metadata?: Json | null
          model?: string | null
          name?: string
          node_type?: string
          power_rating_w?: number | null
          rack_id?: string
          serial_number?: string | null
          status?: string | null
          u_height?: number | null
          u_position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dcim_nodes_rack_id_fkey"
            columns: ["rack_id"]
            isOneToOne: false
            referencedRelation: "dcim_racks"
            referencedColumns: ["id"]
          },
        ]
      }
      dcim_power_equipment: {
        Row: {
          capacity_kw: number | null
          created_at: string
          equipment_type: string
          id: string
          manufacturer: string | null
          model: string | null
          name: string
          phases: number | null
          rack_id: string | null
          redundancy_type: string | null
          room_id: string | null
          status: string | null
          voltage: number | null
        }
        Insert: {
          capacity_kw?: number | null
          created_at?: string
          equipment_type: string
          id?: string
          manufacturer?: string | null
          model?: string | null
          name: string
          phases?: number | null
          rack_id?: string | null
          redundancy_type?: string | null
          room_id?: string | null
          status?: string | null
          voltage?: number | null
        }
        Update: {
          capacity_kw?: number | null
          created_at?: string
          equipment_type?: string
          id?: string
          manufacturer?: string | null
          model?: string | null
          name?: string
          phases?: number | null
          rack_id?: string | null
          redundancy_type?: string | null
          room_id?: string | null
          status?: string | null
          voltage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dcim_power_equipment_rack_id_fkey"
            columns: ["rack_id"]
            isOneToOne: false
            referencedRelation: "dcim_racks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dcim_power_equipment_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "dcim_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      dcim_racks: {
        Row: {
          cooling_capacity_kw: number | null
          created_at: string
          id: string
          name: string
          position: number | null
          power_budget_kw: number | null
          row_id: string
          u_capacity: number | null
        }
        Insert: {
          cooling_capacity_kw?: number | null
          created_at?: string
          id?: string
          name: string
          position?: number | null
          power_budget_kw?: number | null
          row_id: string
          u_capacity?: number | null
        }
        Update: {
          cooling_capacity_kw?: number | null
          created_at?: string
          id?: string
          name?: string
          position?: number | null
          power_budget_kw?: number | null
          row_id?: string
          u_capacity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dcim_racks_row_id_fkey"
            columns: ["row_id"]
            isOneToOne: false
            referencedRelation: "dcim_rows"
            referencedColumns: ["id"]
          },
        ]
      }
      dcim_rooms: {
        Row: {
          cooling_type: string | null
          created_at: string
          floor: string | null
          id: string
          name: string
          power_capacity_kw: number | null
          site_id: string
        }
        Insert: {
          cooling_type?: string | null
          created_at?: string
          floor?: string | null
          id?: string
          name: string
          power_capacity_kw?: number | null
          site_id: string
        }
        Update: {
          cooling_type?: string | null
          created_at?: string
          floor?: string | null
          id?: string
          name?: string
          power_capacity_kw?: number | null
          site_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dcim_rooms_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "dcim_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      dcim_rows: {
        Row: {
          aisle_type: string | null
          created_at: string
          id: string
          name: string
          room_id: string
        }
        Insert: {
          aisle_type?: string | null
          created_at?: string
          id?: string
          name: string
          room_id: string
        }
        Update: {
          aisle_type?: string | null
          created_at?: string
          id?: string
          name?: string
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dcim_rows_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "dcim_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      dcim_runbook_executions: {
        Row: {
          completed_at: string | null
          created_at: string
          executed_by: string | null
          execution_log: Json | null
          id: string
          metrics_after: Json | null
          metrics_before: Json | null
          recommendation_id: string | null
          runbook_id: string
          started_at: string | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          executed_by?: string | null
          execution_log?: Json | null
          id?: string
          metrics_after?: Json | null
          metrics_before?: Json | null
          recommendation_id?: string | null
          runbook_id: string
          started_at?: string | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          executed_by?: string | null
          execution_log?: Json | null
          id?: string
          metrics_after?: Json | null
          metrics_before?: Json | null
          recommendation_id?: string | null
          runbook_id?: string
          started_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dcim_runbook_executions_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "dcim_agent_recommendations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dcim_runbook_executions_runbook_id_fkey"
            columns: ["runbook_id"]
            isOneToOne: false
            referencedRelation: "dcim_runbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      dcim_runbooks: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_automated: boolean | null
          name: string
          prechecks: Json | null
          requires_approval: boolean | null
          rollback_steps: Json | null
          site_id: string
          steps: Json
          trigger_conditions: Json | null
          updated_at: string
          verification: Json | null
          version: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_automated?: boolean | null
          name: string
          prechecks?: Json | null
          requires_approval?: boolean | null
          rollback_steps?: Json | null
          site_id: string
          steps: Json
          trigger_conditions?: Json | null
          updated_at?: string
          verification?: Json | null
          version?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_automated?: boolean | null
          name?: string
          prechecks?: Json | null
          requires_approval?: boolean | null
          rollback_steps?: Json | null
          site_id?: string
          steps?: Json
          trigger_conditions?: Json | null
          updated_at?: string
          verification?: Json | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dcim_runbooks_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "dcim_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      dcim_sites: {
        Row: {
          capacity_mw: number | null
          created_at: string
          id: string
          location: string | null
          name: string
          pue_target: number | null
          region: string | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          capacity_mw?: number | null
          created_at?: string
          id?: string
          location?: string | null
          name: string
          pue_target?: number | null
          region?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          capacity_mw?: number | null
          created_at?: string
          id?: string
          location?: string | null
          name?: string
          pue_target?: number | null
          region?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dcim_telemetry: {
        Row: {
          entity_id: string
          entity_type: string
          id: string
          metadata: Json | null
          metric_type: string
          site_id: string
          timestamp: string
          unit: string | null
          value: number
        }
        Insert: {
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json | null
          metric_type: string
          site_id: string
          timestamp?: string
          unit?: string | null
          value: number
        }
        Update: {
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json | null
          metric_type?: string
          site_id?: string
          timestamp?: string
          unit?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "dcim_telemetry_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "dcim_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      dcim_workload_allocations: {
        Row: {
          accelerator_ids: string[] | null
          allocated_at: string | null
          id: string
          node_id: string
          released_at: string | null
          workload_id: string
        }
        Insert: {
          accelerator_ids?: string[] | null
          allocated_at?: string | null
          id?: string
          node_id: string
          released_at?: string | null
          workload_id: string
        }
        Update: {
          accelerator_ids?: string[] | null
          allocated_at?: string | null
          id?: string
          node_id?: string
          released_at?: string | null
          workload_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dcim_workload_allocations_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "dcim_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dcim_workload_allocations_workload_id_fkey"
            columns: ["workload_id"]
            isOneToOne: false
            referencedRelation: "dcim_workloads"
            referencedColumns: ["id"]
          },
        ]
      }
      dcim_workloads: {
        Row: {
          completed_at: string | null
          created_at: string
          gpu_count: number | null
          id: string
          job_id: string
          job_name: string | null
          metadata: Json | null
          model_signature: string | null
          node_count: number | null
          priority: number | null
          scheduler_type: string | null
          signature_type: string | null
          site_id: string
          started_at: string | null
          status: string | null
          submitted_at: string | null
          workload_class: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          gpu_count?: number | null
          id?: string
          job_id: string
          job_name?: string | null
          metadata?: Json | null
          model_signature?: string | null
          node_count?: number | null
          priority?: number | null
          scheduler_type?: string | null
          signature_type?: string | null
          site_id: string
          started_at?: string | null
          status?: string | null
          submitted_at?: string | null
          workload_class?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          gpu_count?: number | null
          id?: string
          job_id?: string
          job_name?: string | null
          metadata?: Json | null
          model_signature?: string | null
          node_count?: number | null
          priority?: number | null
          scheduler_type?: string | null
          signature_type?: string | null
          site_id?: string
          started_at?: string | null
          status?: string | null
          submitted_at?: string | null
          workload_class?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dcim_workloads_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "dcim_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      facility_coefficients: {
        Row: {
          created_at: string | null
          grid_co2_kg_per_kwh: number | null
          id: string
          provider: string | null
          pue: number
          region_code: string
          region_name: string | null
          renewable_pct: number | null
          updated_at: string | null
          wue_l_per_kwh: number | null
        }
        Insert: {
          created_at?: string | null
          grid_co2_kg_per_kwh?: number | null
          id?: string
          provider?: string | null
          pue?: number
          region_code: string
          region_name?: string | null
          renewable_pct?: number | null
          updated_at?: string | null
          wue_l_per_kwh?: number | null
        }
        Update: {
          created_at?: string | null
          grid_co2_kg_per_kwh?: number | null
          id?: string
          provider?: string | null
          pue?: number
          region_code?: string
          region_name?: string | null
          renewable_pct?: number | null
          updated_at?: string | null
          wue_l_per_kwh?: number | null
        }
        Relationships: []
      }
      global_datacenter_stats: {
        Row: {
          available_grosspower_data: number | null
          available_whitespace_data: number | null
          country: string
          created_at: string | null
          datacenters_grosspower_na: number | null
          datacenters_whitespace_na: number | null
          datacenters_with_metrics: number | null
          id: string
          region: string
          total_datacenters: number
          updated_at: string | null
        }
        Insert: {
          available_grosspower_data?: number | null
          available_whitespace_data?: number | null
          country: string
          created_at?: string | null
          datacenters_grosspower_na?: number | null
          datacenters_whitespace_na?: number | null
          datacenters_with_metrics?: number | null
          id?: string
          region: string
          total_datacenters?: number
          updated_at?: string | null
        }
        Update: {
          available_grosspower_data?: number | null
          available_whitespace_data?: number | null
          country?: string
          created_at?: string | null
          datacenters_grosspower_na?: number | null
          datacenters_whitespace_na?: number | null
          datacenters_with_metrics?: number | null
          id?: string
          region?: string
          total_datacenters?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      job_runs: {
        Row: {
          accelerator_id: string | null
          avg_gpu_util_pct: number | null
          avg_power_w: number | null
          cloud_cost_usd: number | null
          co2_kg_estimated: number | null
          created_at: string | null
          device_count: number | null
          ended_at: string | null
          energy_kwh_total: number | null
          facility_id: string | null
          id: string
          job_name: string
          metadata: Json | null
          model_name: string | null
          peak_gpu_util_pct: number | null
          started_at: string | null
          status: string | null
          tokens_processed: number | null
          user_id: string
          water_l_estimated: number | null
          workload_type: string | null
        }
        Insert: {
          accelerator_id?: string | null
          avg_gpu_util_pct?: number | null
          avg_power_w?: number | null
          cloud_cost_usd?: number | null
          co2_kg_estimated?: number | null
          created_at?: string | null
          device_count?: number | null
          ended_at?: string | null
          energy_kwh_total?: number | null
          facility_id?: string | null
          id?: string
          job_name: string
          metadata?: Json | null
          model_name?: string | null
          peak_gpu_util_pct?: number | null
          started_at?: string | null
          status?: string | null
          tokens_processed?: number | null
          user_id: string
          water_l_estimated?: number | null
          workload_type?: string | null
        }
        Update: {
          accelerator_id?: string | null
          avg_gpu_util_pct?: number | null
          avg_power_w?: number | null
          cloud_cost_usd?: number | null
          co2_kg_estimated?: number | null
          created_at?: string | null
          device_count?: number | null
          ended_at?: string | null
          energy_kwh_total?: number | null
          facility_id?: string | null
          id?: string
          job_name?: string
          metadata?: Json | null
          model_name?: string | null
          peak_gpu_util_pct?: number | null
          started_at?: string | null
          status?: string | null
          tokens_processed?: number | null
          user_id?: string
          water_l_estimated?: number | null
          workload_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_runs_accelerator_id_fkey"
            columns: ["accelerator_id"]
            isOneToOne: false
            referencedRelation: "accelerator_specs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_runs_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facility_coefficients"
            referencedColumns: ["id"]
          },
        ]
      }
      lightos_projects: {
        Row: {
          build_time_seconds: number | null
          created_at: string
          description: string
          files_count: number | null
          generated_plan: Json | null
          id: string
          lines_of_code: number | null
          mock_ui_type: string | null
          name: string
          stack: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          build_time_seconds?: number | null
          created_at?: string
          description: string
          files_count?: number | null
          generated_plan?: Json | null
          id?: string
          lines_of_code?: number | null
          mock_ui_type?: string | null
          name: string
          stack?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          build_time_seconds?: number | null
          created_at?: string
          description?: string
          files_count?: number | null
          generated_plan?: Json | null
          id?: string
          lines_of_code?: number | null
          mock_ui_type?: string | null
          name?: string
          stack?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      llm_chat_messages: {
        Row: {
          attachments: Json | null
          content: string
          created_at: string
          id: string
          role: string
          session_id: string
        }
        Insert: {
          attachments?: Json | null
          content: string
          created_at?: string
          id?: string
          role: string
          session_id: string
        }
        Update: {
          attachments?: Json | null
          content?: string
          created_at?: string
          id?: string
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "llm_chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "llm_chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      llm_chat_sessions: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pcb_chat_messages: {
        Row: {
          chat_session_id: string
          content: string
          created_at: string | null
          id: string
          role: string
          tool_calls: Json | null
        }
        Insert: {
          chat_session_id: string
          content: string
          created_at?: string | null
          id?: string
          role: string
          tool_calls?: Json | null
        }
        Update: {
          chat_session_id?: string
          content?: string
          created_at?: string | null
          id?: string
          role?: string
          tool_calls?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "pcb_chat_messages_chat_session_id_fkey"
            columns: ["chat_session_id"]
            isOneToOne: false
            referencedRelation: "pcb_chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      pcb_chat_sessions: {
        Row: {
          created_at: string | null
          id: string
          project_id: string
          title: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          project_id: string
          title?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          project_id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pcb_chat_sessions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "pcb_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      pcb_design_objects: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          name: string
          project_id: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          name: string
          project_id: string
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          project_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "pcb_design_objects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "pcb_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      pcb_design_versions: {
        Row: {
          created_at: string | null
          design_snapshot: Json
          id: string
          project_id: string
          summary_text: string | null
          version_number: number
        }
        Insert: {
          created_at?: string | null
          design_snapshot?: Json
          id?: string
          project_id: string
          summary_text?: string | null
          version_number: number
        }
        Update: {
          created_at?: string | null
          design_snapshot?: Json
          id?: string
          project_id?: string
          summary_text?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "pcb_design_versions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "pcb_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      pcb_projects: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          owner_user_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          owner_user_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          owner_user_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      processed_metrics: {
        Row: {
          ai_energy_score: number | null
          created_at: string
          eco_efficiency_rating: string | null
          id: string
          identified_drivers: Json | null
          predicted_consumption: number | null
          telemetry_id: string | null
          user_id: string
        }
        Insert: {
          ai_energy_score?: number | null
          created_at?: string
          eco_efficiency_rating?: string | null
          id?: string
          identified_drivers?: Json | null
          predicted_consumption?: number | null
          telemetry_id?: string | null
          user_id: string
        }
        Update: {
          ai_energy_score?: number | null
          created_at?: string
          eco_efficiency_rating?: string | null
          id?: string
          identified_drivers?: Json | null
          predicted_consumption?: number | null
          telemetry_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "processed_metrics_telemetry_id_fkey"
            columns: ["telemetry_id"]
            isOneToOne: false
            referencedRelation: "raw_telemetry"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      raw_telemetry: {
        Row: {
          accelerator_vendor: string | null
          amd_gpu_wattage: number | null
          amd_memory_gb: number | null
          amd_utilization: number | null
          created_at: string
          facility_id: string | null
          gpu_wattage: number | null
          humidity_pct: number | null
          hvac_status: string | null
          id: string
          model_id: string | null
          nvidia_memory_gb: number | null
          nvidia_utilization: number | null
          raw_payload: Json | null
          temp_c: number | null
          timestamp: string
          tokens_generated: number | null
          tpu_memory_gb: number | null
          tpu_utilization: number | null
          tpu_wattage: number | null
          user_id: string
        }
        Insert: {
          accelerator_vendor?: string | null
          amd_gpu_wattage?: number | null
          amd_memory_gb?: number | null
          amd_utilization?: number | null
          created_at?: string
          facility_id?: string | null
          gpu_wattage?: number | null
          humidity_pct?: number | null
          hvac_status?: string | null
          id?: string
          model_id?: string | null
          nvidia_memory_gb?: number | null
          nvidia_utilization?: number | null
          raw_payload?: Json | null
          temp_c?: number | null
          timestamp?: string
          tokens_generated?: number | null
          tpu_memory_gb?: number | null
          tpu_utilization?: number | null
          tpu_wattage?: number | null
          user_id: string
        }
        Update: {
          accelerator_vendor?: string | null
          amd_gpu_wattage?: number | null
          amd_memory_gb?: number | null
          amd_utilization?: number | null
          created_at?: string
          facility_id?: string | null
          gpu_wattage?: number | null
          humidity_pct?: number | null
          hvac_status?: string | null
          id?: string
          model_id?: string | null
          nvidia_memory_gb?: number | null
          nvidia_utilization?: number | null
          raw_payload?: Json | null
          temp_c?: number | null
          timestamp?: string
          tokens_generated?: number | null
          tpu_memory_gb?: number | null
          tpu_utilization?: number | null
          tpu_wattage?: number | null
          user_id?: string
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          created_at: string
          description: string | null
          id: string
          impact_level: string | null
          metric_id: string | null
          requires_approval: boolean | null
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          impact_level?: string | null
          metric_id?: string | null
          requires_approval?: boolean | null
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          impact_level?: string | null
          metric_id?: string | null
          requires_approval?: boolean | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_metric_id_fkey"
            columns: ["metric_id"]
            isOneToOne: false
            referencedRelation: "processed_metrics"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
