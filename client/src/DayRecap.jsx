import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./DayRecap.css";
import { BookOpen, MapPin, Tag, Image, Edit } from "lucide-react";

const DayRecap = () => {
  const { id: dayId } = useParams();
  const navigate = useNavigate();
  const [journal, setJournal] = useState(null);
  const [day, setDay] = useState(null);
  const [places, setPlaces] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [journalEdit, setJournalEdit] = useState("");
  const [placesEdit, setPlacesEdit] = useState([]);
  const [tagsEdit, setTagsEdit] = useState([]);

  useEffect(() => {
    const fetchJournal = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/days/${dayId}/recap`);
        const data = await response.json();
        setJournal(data.journal);
        setDay(data.day);
        setPlaces(data.places);

        const photoRes = await fetch(`http://localhost:8000/api/days/${dayId}/photos`);
        const photoData = await photoRes.json();
        setPhotos(photoData);
      } catch (err) {
        console.error("Error loading recap:", err);
      }
    };
    fetchJournal();
  }, [dayId]);

  if (!day) {
    return (
      <div className="dayrecap-container">
        <h1>Day Recap</h1>
        <p>No journal entry was found for this day.</p>
        <button className="primary-btn back-button" onClick={() => navigate(-1)}>Back</button>
      </div>
    );
  }

  const date = new Date(day.day).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const handlePhotoUpload = async (e) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const newFiles = Array.from(e.target.files);
    const filteredFiles = newFiles.filter(file => validTypes.includes(file.type));

    if (filteredFiles.length !== newFiles.length) {
      alert("Some files were not valid image types (only jpg, jpeg, png, gif are allowed).");
    }

    for (const file of filteredFiles) {
      const photoForm = new FormData();
      photoForm.append('photo', file);
      await fetch(`http://localhost:8000/api/days/${dayId}/photos`, {
        method: 'POST',
        body: photoForm,
      });
    }

    const photoRes = await fetch(`http://localhost:8000/api/days/${dayId}/photos`);
    const photoData = await photoRes.json();
    setPhotos(photoData);
  };

  const removePhoto = async (photoId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/photos/${photoId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        alert('Failed to delete photo from server.');
        return;
      }
    } catch (err) {
      alert('Error deleting photo from server.');
      return;
    }
    setPhotos(photos.filter(photo => photo.id !== photoId));
  };

  const handleEditClick = () => {
    setJournalEdit(journal?.note || "");
    setPlacesEdit(places.map(p => p.name));
    setTagsEdit(journal?.tags || []);
    setEditMode(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:8000/api/journal/${dayId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          note: journalEdit,
          highlight: journal?.highlight || false,
          tags: tagsEdit,
        }),
        credentials: "include",
      });

      if (!res.ok) {
        alert("Failed to update journal entry.");
        return;
      }
      const updatedJournal = await res.json();
      setJournal(updatedJournal);

      // Update places (if you have an endpoint for this)

      for (const place of placesEdit.map((name, i) => ({
        id: places[i]?.id,
        name
      }))) {
        await fetch(`http://localhost:8000/api/places/${place.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: place.name })
        });
      }
      setPlaces(placesEdit.map((name, i) => ({ id: places[i]?.id || i, name })));


      setEditMode(false);
    } catch (err) {
      alert("Error updating day recap.");
    }
  };

  return (
    <div className="dayrecap-container">
      <button className="primary-btn back-button" onClick={() => navigate(-1)}>Back</button>
      <h1>Day Recap {journal?.highlight && <span className="highlight-star" title="Highlight Day">⭐️</span>}</h1>
      <h3 style={{ color: "#156E75" }}>{date}</h3>

      <div className="dayrecap-card">
        {!editMode && (
          <button className="edit-dayrecap-btn edit-btn-top-right" onClick={handleEditClick}>
            <Edit size={19} className="inline-icon" /> <span className="edit-label">Edit</span>
          </button>
        )}
        {/* Left Column */}
        <div className="recap-left">
          <form onSubmit={handleEditSubmit}>
            {/* Journal Entry */}
            <div className="recap-section recap-journal">
              <div className="recap-section-header journal-header">
                <h4><BookOpen size={19} className="inline-icon" /> Today's Journal</h4>
              </div>
              {editMode ? (
                <textarea value={journalEdit} onChange={e => setJournalEdit(e.target.value)} />
              ) : (
                <p>{journal?.note || "No entry."}</p>
              )}
            </div>

            {/* Places Visited */}
            <div className="recap-section">
              <div className="recap-section-header">
                <h4><MapPin size={19} className="inline-icon" /> Places Visited</h4>
              </div>
              {editMode ? (
                placesEdit.map((place, idx) => (
                  <input
                  type="text"
                    key={idx}
                    value={place}
                    onChange={e => {
                      const newPlaces = [...placesEdit];
                      newPlaces[idx] = e.target.value;
                      setPlacesEdit(newPlaces);
                    }}
                    style={{ marginBottom: 8 }}
                  />
                ))
              ) : (
                <ul>
                  {places.length > 0 ? (
                    places.map((place) => <li key={place.id}>{place.name}</li>)
                  ) : (
                    <li>None listed</li>
                  )}
                </ul>
              )}
            </div>

            {/* Tags */}
            <div className="recap-section">
              <div className="recap-section-header">
                <h4><Tag size={19} className="inline-icon" /> Tags</h4>
              </div>
              {editMode ? (
                <input
                type="text"
                  value={tagsEdit.join(",")}
                  onChange={e => setTagsEdit(e.target.value.split(",").map(t => t.trim()))}
                  placeholder="Comma separated tags"
                />
              ) : (
                journal?.tags?.length > 0 ? (
                  <div className="tags-container">
                    {journal.tags.map((tag, index) => (
                      <span className="tag" key={index}>#{tag}</span>
                    ))}
                  </div>
                ) : (
                  <p>None</p>
                )
              )}
            </div>

            {/* Trip Highlight box */}
            {journal?.highlight && (
              <div className="recap-section">
                <div className="recap-section-header">
                  <h4>🌟 Trip Highlight</h4>
                </div>
                <p>This day was marked as a trip highlight!</p>
              </div>
            )}

            {/* Save/Cancel */}
            {editMode && (
              <div className="edit-btn-group">
                <button type="submit" className="primary-btn dayrecap-save-button">Save</button>
                <button type="button" className="primary-btn" onClick={() => setEditMode(false)}>Cancel</button>
              </div>
            )}
          </form>
        </div>

        {/* Right Column: Photos */}
        <div className="recap-right">
          <div className="photo-grid">
            {photos.map((photo, idx) => (
              <div key={idx} className="photo-slot">
                <div className="photo-wrapper">
                  <img src={photo.image_url} alt={`Journal visual ${idx}`} />
                  <button
                    type="button"
                    className="delete-preview-btn-dayrecap"
                    onClick={() => removePhoto(photo.id)}
                    title="Remove Photo"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="icon-x-mark">
                      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {editMode && (
            <div className="add-photo-align-bottom">
              <label className="upload-btn">
                <Image size={19} className="inline-icon" /> Add Photo
                <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} hidden />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DayRecap;
