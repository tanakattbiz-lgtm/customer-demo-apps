import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  buildSeed,
  genId,
  DEFAULT_STAFF_ID,
  DEFAULT_ADMIN_ID,
  type AppData,
  type DailyReport,
  type Vehicle,
  type Staff,
  type InsurancePolicy,
  type AccidentRecord,
  type AccidentStatus,
} from "./data/seed";

type Role = "staff" | "admin";

interface State extends AppData {
  authed: boolean;
  role: Role;
  currentStaffId: string;
  currentAdminId: string;

  loginStaff: (staffId: string) => void;
  loginAdmin: (adminId: string) => void;
  logout: () => void;

  submitDailyReport: (
    payload: Omit<
      DailyReport,
      "id" | "reportedAt" | "status" | "approvedBy" | "approvedAt"
    >,
  ) => DailyReport;
  approveReport: (reportId: string, adminName: string) => void;

  upsertVehicleInspection: (
    input: {
      vehicleId?: string;
      plateNumber: string;
      model: string;
      chassisNumber: string;
      inspectionExpiry: string;
      officeId: string;
    },
  ) => void;

  upsertInsurancePolicy: (policy: InsurancePolicy) => void;

  addStaff: (input: { name: string; officeId: string; vehicleId: string }) => void;
  updateStaffAssignment: (
    staffId: string,
    patch: { officeId?: string; vehicleId?: string },
  ) => void;

  addAccidentRecord: (
    record: Omit<AccidentRecord, "id" | "createdAt">,
  ) => void;
  updateAccidentStatus: (id: string, status: AccidentStatus) => void;
  updateAccidentPayout: (id: string, insurancePayout: number) => void;

  reset: () => void;
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...buildSeed(),
      authed: false,
      role: "staff",
      currentStaffId: DEFAULT_STAFF_ID,
      currentAdminId: DEFAULT_ADMIN_ID,

      loginStaff: (staffId) =>
        set({ authed: true, role: "staff", currentStaffId: staffId }),
      loginAdmin: (adminId) =>
        set({ authed: true, role: "admin", currentAdminId: adminId }),
      logout: () => set({ authed: false }),

      submitDailyReport: (payload) => {
        const report: DailyReport = {
          ...payload,
          id: genId("rep"),
          reportedAt: new Date().toISOString(),
          status: "pending",
        };
        set((s) => ({ dailyReports: [report, ...s.dailyReports] }));
        return report;
      },

      approveReport: (reportId, adminName) =>
        set((s) => {
          const now = new Date().toISOString();
          const report = s.dailyReports.find((r) => r.id === reportId);
          if (!report || report.status === "approved") return s;
          return {
            dailyReports: s.dailyReports.map((r) =>
              r.id === reportId
                ? { ...r, status: "approved", approvedBy: adminName, approvedAt: now }
                : r,
            ),
            auditLog: [
              {
                id: genId("log"),
                reportId,
                staffId: report.staffId,
                officeId: report.officeId,
                vehicleId: report.vehicleId,
                adminName,
                confirmedAt: now,
              },
              ...s.auditLog,
            ],
          };
        }),

      upsertVehicleInspection: (input) =>
        set((s) => {
          if (input.vehicleId) {
            return {
              vehicles: s.vehicles.map((v) =>
                v.id === input.vehicleId
                  ? {
                      ...v,
                      plateNumber: input.plateNumber,
                      model: input.model,
                      chassisNumber: input.chassisNumber,
                      inspectionExpiry: input.inspectionExpiry,
                      inspectionRegisteredAt: new Date().toISOString().slice(0, 10),
                    }
                  : v,
              ),
            };
          }
          const newVehicle: Vehicle = {
            id: genId("veh"),
            plateNumber: input.plateNumber,
            model: input.model,
            chassisNumber: input.chassisNumber,
            officeId: input.officeId,
            odometerKm: 0,
            inspectionExpiry: input.inspectionExpiry,
            inspectionRegisteredAt: new Date().toISOString().slice(0, 10),
            status: "in_service",
          };
          return { vehicles: [newVehicle, ...s.vehicles] };
        }),

      upsertInsurancePolicy: (policy) =>
        set((s) => {
          const exists = s.insurancePolicies.some((p) => p.vehicleId === policy.vehicleId);
          return {
            insurancePolicies: exists
              ? s.insurancePolicies.map((p) => (p.vehicleId === policy.vehicleId ? policy : p))
              : [...s.insurancePolicies, policy],
          };
        }),

      addStaff: ({ name, officeId, vehicleId }) =>
        set((s) => {
          const newStaff: Staff = {
            id: genId("stf"),
            name,
            officeId,
            vehicleId,
            username: `staff${s.staffList.length + 1}`,
          };
          return { staffList: [...s.staffList, newStaff] };
        }),

      updateStaffAssignment: (staffId, patch) =>
        set((s) => ({
          staffList: s.staffList.map((st) => (st.id === staffId ? { ...st, ...patch } : st)),
        })),

      addAccidentRecord: (record) =>
        set((s) => ({
          accidentRecords: [
            { ...record, id: genId("acc"), createdAt: new Date().toISOString() },
            ...s.accidentRecords,
          ],
        })),

      updateAccidentStatus: (id, status) =>
        set((s) => ({
          accidentRecords: s.accidentRecords.map((a) =>
            a.id === id ? { ...a, status } : a,
          ),
        })),

      updateAccidentPayout: (id, insurancePayout) =>
        set((s) => ({
          accidentRecords: s.accidentRecords.map((a) =>
            a.id === id ? { ...a, insurancePayout } : a,
          ),
        })),

      reset: () =>
        set({
          ...buildSeed(),
          authed: get().authed,
          role: get().role,
          currentStaffId: DEFAULT_STAFF_ID,
          currentAdminId: DEFAULT_ADMIN_ID,
        }),
    }),
    {
      name: "vehicle-management-store",
      version: 1,
      partialize: (s) => ({
        offices: s.offices,
        staffList: s.staffList,
        admins: s.admins,
        vehicles: s.vehicles,
        dailyReports: s.dailyReports,
        auditLog: s.auditLog,
        insurancePolicies: s.insurancePolicies,
        accidentRecords: s.accidentRecords,
        authed: s.authed,
        role: s.role,
        currentStaffId: s.currentStaffId,
        currentAdminId: s.currentAdminId,
      }),
    },
  ),
);

export { DEFAULT_STAFF_ID, DEFAULT_ADMIN_ID };
