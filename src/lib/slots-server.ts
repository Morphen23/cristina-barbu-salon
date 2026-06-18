import { getBlockedDateSet } from "./blocked-days";
import { getBookableDates, toDateKey } from "./slots";

export async function getBookableDatesAsync(): Promise<Date[]> {
  const blocked = await getBlockedDateSet();
  return getBookableDates().filter((date) => !blocked.has(toDateKey(date)));
}
