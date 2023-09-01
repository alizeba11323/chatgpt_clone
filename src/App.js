import { useState } from "react";
const API_KEY = "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";
function App() {
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => {
    setPrompt(e.target.value);
  };
  const generateAns = async () => {
    setAnswer("");
    setLoading(true);
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          stream: true,
        }),
      });
      setLoading(false);
      const data = res.body.getReader();
      const txtDecoder = new TextDecoder("utf-8");
      while (true) {
        const chunk = await data.read();
        const { done, value } = chunk;
        if (done) break;
        const decodechunk = txtDecoder.decode(value);
        const line = decodechunk.split("\n");
        const newChunk = line
          .map((line) => line.replace(/^data:/, "").trim())
          .filter((line) => line !== "" && line !== "[DONE]")
          .map((line) => JSON.parse(line));
        for (let ans of newChunk) {
          const { choices } = ans;
          const { delta } = choices[0];
          if (Object.keys(delta).length > 0 && delta.content) {
            setAnswer((prev) => prev + delta.content);
          }
        }
      }
      setPrompt("");
    } catch (err) {
      console.log(err.message);
    }
  };
  return (
    <div className="App">
      {loading && <p>Loading...</p>}
      {answer && <p style={{ whiteSpace: "pre-line" }}>{answer}</p>}
      <input type="text" name="prompt" value={prompt} onChange={handleChange} />
      <button onClick={generateAns}>generate</button>
    </div>
  );
}

export default App;
