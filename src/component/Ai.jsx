import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AiApp = () => {
  const [page, setPage] = useState("home");
  const [prompt, setPrompt] = useState("");
  const [images, setImages] = useState(Array(9).fill(null));
  const [loading, setLoading] = useState(false);
  const [seeds, setSeeds] = useState(
    Array(9)
      .fill(null)
      .map(() => Math.floor(Math.random() * 1000000))
  );
  const [customSeeds, setCustomSeeds] = useState(false);
  const [models, setModels] = useState([]);
  const [model, setModel] = useState("");
  const [prevDate, setPrevDate] = useState(null);

  const generateRandomSeeds = () => {
    setSeeds(
      Array(9)
        .fill(null)
        .map(() => Math.floor(Math.random() * 1000000))
    );
  };

  const handleSeedChange = (index, value) => {
    const newSeeds = [...seeds];
    newSeeds[index] = value
      ? parseInt(value)
      : Math.floor(Math.random() * 1000000);
    setSeeds(newSeeds);
  };

  const fetchImage = async (index) => {
    try {
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(
        prompt
      )}?nologo=true&seed=${seeds[index]}&model=${model}`;
      const response = await fetch(url);

      if (!response.ok) throw new Error("Failed to fetch image");

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);

      setImages((prev) => {
        const newImages = [...prev];
        newImages[index] = imageUrl;
        return newImages;
      });
    } catch (error) {
      console.error(`Error fetching image ${index + 1}:`, error);
      setImages((prev) => {
        const newImages = [...prev];
        newImages[index] = "error";
        return newImages;
      });
      toast.error(`Failed to load image ${index + 1}`);
    }
  };

  const generateImages = async () => {
    if (prevDate) {
        const currentDate = new Date();
        const timeDiff = currentDate - prevDate;
        const secondsDiff = Math.floor(timeDiff / 1000);
    
        if (secondsDiff < 5000) {;
            toast.error(`You can generate again in ${Math.max(0, 5 - Math.floor(secondsDiff / 60))} minutes`);
            toast.info(`For error free generation change the current tab.`);
            return;
        }
    }
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setLoading(true);
    setImages(Array(9).fill(null));

    if (!customSeeds) {
      generateRandomSeeds();
    }

    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        fetchImage(i);
        if (i === 8) setLoading(false);
      }, i * 5000);
    }
    setPrevDate(new Date());
  };

  const resetAiApp = () => {
    setPrompt("");
    setImages(Array(9).fill(null));
    setPage("home");
    generateRandomSeeds();
  };

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch("https://image.pollinations.ai/models");
        if (!response.ok) throw new Error("Failed to fetch models");
        const data = await response.json();
        setModels(data);
        if (data.length > 0) {
          setModel(data[0]);
        }
      } catch (error) {
        console.error("Error fetching models:", error);
        toast.error("Failed to load models");
      }
    };
    fetchModels();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <ToastContainer position="top-right" autoClose={3000} />

      {page === "home" ? (
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
          <h1 className="text-3xl font-bold text-center text-indigo-600 mb-6">
            AI Image Generator
          </h1>
          <p className="text-gray-600 mb-8 text-center">
            Enter a prompt below to generate 9 unique AI images. Images will
            load one by one every 5 seconds.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPage("gallery");
              setTimeout(generateImages, 500); // Small delay to allow state update
            }}
          >
            <div className="mb-6">
              <label
                htmlFor="prompt"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Prompt
              </label>
              <input
                type="text"
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                placeholder="Describe the image you want to generate..."
                required
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="model"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Select A Ai Model
              </label>
              <select
                onChange={(e) => setModel(e.target.value)}
                value={model}
                name="model"
                id="model"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
              >
                <option value="">Select a model</option>
                {models.map((modelName) => (
                  <option key={modelName} value={modelName}>
                    {modelName}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={customSeeds}
                  onChange={() => setCustomSeeds(!customSeeds)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Use custom seeds for each image
                </span>
              </label>
            </div>

            {customSeeds && (
              <div className="mb-6 grid grid-cols-3 gap-4">
                {seeds.map((seed, index) => (
                  <div key={index} className="flex flex-col">
                    <label
                      htmlFor={`seed-${index}`}
                      className="text-xs text-gray-500 mb-1"
                    >
                      Image {index + 1} Seed
                    </label>
                    <input
                      type="number"
                      id={`seed-${index}`}
                      value={seed}
                      onChange={(e) => handleSeedChange(index, e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm text-black"
                      placeholder="Random"
                    />
                  </div>
                ))}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
            >
              Generate Images
            </button>
          </form>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-indigo-600">
              Generated Images
            </h1>
            <button
              onClick={resetAiApp}
              className="bg-gray-200 text-gray-700 py-1 px-3 rounded-md hover:bg-gray-300 transition-colors text-sm"
            >
              New Generation
            </button>
          </div>

          <p className="text-gray-600 mb-6">
            Prompt: <span className="font-medium">{prompt}</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
                  {image === null ? (
                    <div className="text-center p-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-500">
                        Loading image {index + 1}...
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Seed: {seeds[index]}
                      </p>
                    </div>
                  ) : image === "error" ? (
                    <div className="text-center p-4 text-red-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 mx-auto mb-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <p>Failed to load image</p>
                      <p className="text-xs mt-1">Seed: {seeds[index]}</p>
                    </div>
                  ) : (
                    <>
                      <img
                        src={image}
                        alt={`Generated from prompt: ${prompt}`}
                        className="w-full h-full object-cover"
                        onError={() => {
                          setImages((prev) => {
                            const newImages = [...prev];
                            newImages[index] = "error";
                            return newImages;
                          });
                          toast.error(`Failed to load image ${index + 1}`);
                        }}
                      />
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                        Seed: {seeds[index]}
                      </div>
                      <button
                        onClick={() => {
                          // Create a temporary anchor element to trigger download
                          const link = document.createElement("a");
                          link.href = image;
                          link.download = `ai-image-${index + 1}-seed-${
                            seeds[index]
                          }.jpg`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
                        title="Download image"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {loading && (
            <div className="mt-6 text-center text-gray-500">
              <p>
                Generating images... Please wait as they load one by one every 5
                seconds.
              </p>
              <p>
                {images.filter((img) => img !== null).length} of 9 images loaded
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AiApp;
