import { appointments } from "@/db/schema";

import { canCancel } from "./scheduling";
import { formatClinicDate, formatClinicTime } from "./time";

export type AppointmentRow = {
  appointment: typeof appointments.$inferSelect;
  patient: { id: string; firstName: string; lastName: string } | null;
  dentist: {
    id: string;
    displayName: string;
    title: string | null;
    specialty: string | null;
    photoUrl: string | null;
  } | null;
  service: {
    id: string;
    name: string;
    durationMinutes: number;
    isTeleconsult: boolean;
  } | null;
};

/**
 * HIPAA posture: every staff read or write of a patient record or medical
 * history leaves a row here. Never log the values themselves — the entity id is
 * the whole point, the content is the thing we are protecting.
 */
export function serialize(row: AppointmentRow) {
  const a = row.appointment;

  return {
    id: a.id,
    startsAt: a.startsAt.toISOString(),
    endsAt: a.endsAt.toISOString(),
    status: a.status,
    isTeleconsult: row.service?.isTeleconsult ?? false,
    streamCallId: a.streamCallId,
    canCancel: a.status === "booked" && canCancel(a.startsAt, new Date()),
    dateLabel: formatClinicDate(a.startsAt),
    timeLabel: formatClinicTime(a.startsAt),
    patient: row.patient,
    dentist: row.dentist,
    service: row.service,
  };
}
