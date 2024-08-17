const FormatDuration = ({ seconds }) => {
  if (seconds < 60) {
    return <span>{`${seconds} seconds`}</span>;
  } else {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return (
      <span>
        {`${minutes} minute${
          minutes > 1 ? "s" : ""
        } ${remainingSeconds} second${remainingSeconds > 1 ? "s" : ""}`}
      </span>
    );
  }
};

export default FormatDuration;
