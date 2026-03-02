onmessage = (e) => {
  console.log("Worker: Message received.");

  const result = e.data[1];

  if (isNaN(result)) {
    postMessage("No data.");
  } else {
    const workerResult = "Result: " + result;
    console.log("Worker: Posting message back to main script");
    postMessage(workerResult);
  }
};
