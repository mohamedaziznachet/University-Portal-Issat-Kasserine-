import React from "react";

function CourseDetails({ course }) {
  if (!course) return null;

  return (
    <article className="panel student-course-details">
      <h3 className="panel__title">{course.title}</h3>
      <p className="dashboard__subtitle">{course.description || "Aucune description."}</p>
      <div className="student-course-meta">
        <div>
          <strong>Enseignant</strong>
          <p>
            {course.teacher?.firstName} {course.teacher?.lastName}
          </p>
          <p>{course.teacher?.email || "N/A"}</p>
        </div>
        <div>
          <strong>Supports</strong>
          <p>{course.documents?.length || 0} document(s)</p>
          <p>{course.videoLinks?.length || 0} vidéo(s)</p>
        </div>
      </div>
      {course.videoLinks?.length ? (
        <div>
          <strong>Liens vidéo</strong>
          <ul className="student-video-list">
            {course.videoLinks.map((link) => (
              <li key={link}>
                <a href={link} target="_blank" rel="noreferrer">
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}

export default CourseDetails;
