

export function calculateOrderDetails(pricePerNight: number, dates: { checkIn: string, checkOut: string } | null) {

  if (!dates || !dates.checkIn || !dates.checkOut) {
    return { nights: 0, totalPrice: 0 };
  }

  const checkInDate = new Date(dates.checkIn);
  const checkOutDate = new Date(dates.checkOut);

  const differenceInTime = checkOutDate.getTime() - checkInDate.getTime();

  const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));

  const nights = differenceInDays > 0 ? differenceInDays : 0;

  return {
    nights,
    totalPrice: nights * pricePerNight,
  };
}