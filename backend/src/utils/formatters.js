const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTimeLabel = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getMinutesAgo = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 0;
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
};

const toAgoLabel = (minutesAgo) => {
  if (minutesAgo < 60) {
    return `${minutesAgo} min ago`;
  }
  if (minutesAgo < 1440) {
    return `${Math.floor(minutesAgo / 60)} hr ago`;
  }
  return `${Math.floor(minutesAgo / 1440)} day ago`;
};

module.exports = {
  formatDate,
  formatDateTimeLabel,
  getMinutesAgo,
  toAgoLabel,
};
