export const getMonthName = (month) => {
  return new Date(2025, month - 1).toLocaleString("en-IN", {
    month: "long",
  });
};

export const numberToWords = (num) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
};
