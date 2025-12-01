import React, { useState } from "react";

export default function CreateCommunityForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Here you would normally send this to a backend
    const newCommunity = { name, description, image };
    console.log("Creating community:", newCommunity);
    alert(`Community "${name}" created!`);

    // Reset form
    setName("");
    setDescription("");
    setImage(null);
  };

  return (
    <form className="create-community-form" onSubmit={handleSubmit}>
      <label>Community Name:</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter community name"
        required
      />

      <label>Description:</label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Enter community description"
        required
      />

      <label>Community Image (optional):</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
      />

      <button type="submit">Create Community</button>
    </form>
  );
}
