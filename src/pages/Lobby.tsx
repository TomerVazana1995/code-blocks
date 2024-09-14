import { useNavigate } from "react-router-dom";

const codeBlocks = [
  { id: 1, title: "Async-case" },
  { id: 2, title: "Promise" },
  { id: 3, title: "Fetch-API" },
  { id: 4, title: "For-loop" },
];

const Lobby = () => {
  const navigate = useNavigate();

  const handleNavigate = (title: string) => {
    navigate(`/code-block/${title}`);
  };
  return (
    <div id="lobby">
      <h1>Choose the block</h1>
      <h2>Pick a topic you want to solve</h2>
      <p>
        Instructions: For each topic, you will get a code block with 2-3
        mistakes that you will have to find and fix. If you are correct, we will
        notify you.
      </p>
      <ul>
        {codeBlocks.map((codeBlock) => (
          <li
            key={codeBlock.id}
            onClick={() => handleNavigate(codeBlock.title)}
          >
            {codeBlock.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Lobby;
