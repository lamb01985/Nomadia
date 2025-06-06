import { useState, useEffect } from 'react';
import './DayView.css';
import { useNavigate, useParams } from 'react-router-dom';


const DayView = () => {
 const [journal, setJournal] = useState('');
 const [highlight, setHighlight] = useState(false);
 const [tags, setTags] = useState([]);
 const [photos, setPhotos] = useState([]);
 const [previewUrls, setPreviewUrls] = useState([]);
 const [day, setDay] = useState(null);
 const [showConfirm, setShowConfirm] = useState(false);
 const navigate = useNavigate();
 const { id: dayId } = useParams();


 const allTags = [
   'Chill', 'Adventurous', 'Romantic', 'New Friends', 'Foodie',
   'Nature', 'Culture', 'Shopping', 'Relaxing'
 ];


 useEffect(() => {
   const fetchDay = async () => {
     try {
       const res = await fetch(`http://127.0.0.1:8000/api/days/${dayId}`);
       const data = await res.json();
       setDay(data);
     } catch (err) {
       console.error('Error loading day data:', err);
     }
   };
   fetchDay();
 }, [dayId]);


 const toggleTag = (tag) => {
   setTags((prev) =>
     prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
   );
 };


 const handlePhotoUpload = (e) => {
   const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
   const newFiles = Array.from(e.target.files);


   const filteredFiles = newFiles.filter(file => validTypes.includes(file.type));
   if (filteredFiles.length !== newFiles.length) {
     alert("Some files were not valid image types (jpg, jpeg, png, gif only).");
   }


   const updatedFiles = [...photos, ...filteredFiles];
   setPhotos(updatedFiles);


   const previews = filteredFiles.map((file) => {
     return new Promise((resolve) => {
       const reader = new FileReader();
       reader.onloadend = () => resolve(reader.result);
       reader.readAsDataURL(file);
     });
   });


   Promise.all(previews).then((newPreviews) => {
     setPreviewUrls((prev) => [...prev, ...newPreviews]);
   });
 };


 const removePhoto = (index) => {
   const newPhotos = photos.filter((_, i) => i !== index);
   const newPreviews = previewUrls.filter((_, i) => i !== index);
   setPhotos(newPhotos);
   setPreviewUrls(newPreviews);
 };


 const handleSaveJournal = async (e) => {
   e.preventDefault();


   const formData = new FormData();
   formData.append('journal_text', journal);
   formData.append('highlight', highlight);
   formData.append('tags', JSON.stringify(tags));


   if (photos.length > 0) {
     formData.append('photo', photos[0]);
   }


   try {
     const res = await fetch(`http://localhost:8000/api/days/${dayId}/journal`, {
       method: 'POST',
       body: formData,
     });


     const result = await res.json();


     if (res.ok) {
       for (let i = 0; i < photos.length; i++) {
         const photoForm = new FormData();
         photoForm.append('photo', photos[i]);


         await fetch(`http://localhost:8000/api/days/${dayId}/photos`, {
           method: 'POST',
           body: photoForm,
         });
       }


        setShowConfirm(true);
        setTimeout(() => {
          setShowConfirm(false);
          navigate(`/trip/${result.trip_id}/highlights`);
        }, 1500);
      } else {
       console.error(result);
       alert('Failed to save journal.');
     }
   } catch (err) {
     console.error(err);
     alert('An error occurred while saving.');
   }
 };


 return (
   <div className="dayview-container">
     <button className="back-button" onClick={() => navigate(-1)}>
       Back
     </button>


     <form className="dayview-card" onSubmit={handleSaveJournal} encType="multipart/form-data">
       <h1 className="dayview-title">Daily Journal</h1>
       <h3 className="journal-date">
         {day
           ? new Date(day.day).toLocaleDateString(undefined, {
               weekday: 'long',
               month: 'long',
               day: 'numeric',
             })
           : 'Loading date...'}
       </h3>
{showConfirm && (
  <div className="cheers-message">
    🎉 Journal entry saved!
  </div>
)}

       <textarea
         placeholder="Write about your day..."
         value={journal}
         onChange={(e) => setJournal(e.target.value)}
       />


       <div className="photo-upload">
         <label className="upload-btn">
           Upload Photo(s)
           <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} hidden />
         </label>
       </div>


       {previewUrls.length > 0 && (
         <div className="image-preview-grid">
           {previewUrls.map((url, index) => (
             <div key={index} className="image-preview-container">
               <img src={url} alt={`Preview ${index}`} className="preview-image" />
               <button
                 type="button"
                 className="delete-preview-btn"
                 onClick={() => removePhoto(index)}
                 title="Remove Photo"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                   strokeWidth={1.5} stroke="currentColor" className="delete-icon">
                   <path strokeLinecap="round" strokeLinejoin="round"
                     d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                 </svg>
               </button>
             </div>
           ))}
         </div>
       )}


       <div className="highlight-toggle">
         <input
           type="checkbox"
           checked={highlight}
           onChange={() => setHighlight(!highlight)}
           id="highlight-check"
         />
         <label htmlFor="highlight-check">Mark this day as a highlight</label>
       </div>


       <div className="tag-buttons">
         {allTags.map((tag) => (
           <button
             type="button"
             key={tag}
             className={`tag ${tags.includes(tag) ? 'active' : ''}`}
             onClick={() => toggleTag(tag)}
           >
             {tag}
           </button>
         ))}
       </div>



       <button type="submit" className="save-btn">Save Journal</button>
     </form>
   </div>
 );
};


export default DayView;
