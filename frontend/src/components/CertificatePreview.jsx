export function CertificatePreview({ learnerName = "Learner", courseTitle = "Course" }) {
  return (
    <section className="certificate-preview">
      <p>Certificate of Completion</p>
      <h1>{learnerName}</h1>
      <p>completed {courseTitle}</p>
    </section>
  );
}
