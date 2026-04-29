import { useQuery } from "@tanstack/react-query";
import { myCourses } from "../api/enrollmentApi";
import { listCourses } from "../api/courseApi";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "../styles/learnerDashboard.css";

export function LearnerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data: enrolledCourses, isLoading: isLoadingEnrolled } = useQuery({
    queryKey: ["learner-courses"],
    queryFn: async () => {
      const res = await myCourses();
      return res.data;
    },
  });

  const { data: catalogCourses, isLoading: isLoadingCatalog } = useQuery({
    queryKey: ["catalog-courses"],
    queryFn: async () => {
      const res = await listCourses();
      return res.data;
    },
  });

  const handleLogout = () => {
    logout();
    navigate("/auth/login", { replace: true });
  };

  const getFirstName = (name) => {
    return name ? name.split(' ')[0] : 'Learner';
  };

  const formatHours = (seconds) => {
    if (!seconds) return "0 hrs";
    const hrs = (seconds / 3600).toFixed(1);
    return `${hrs} hrs`;
  };

  const calculateTimeLeft = (enrollment) => {
    const totalSecs = enrollment.course.totalDuration || 36000; 
    const remainingSecs = totalSecs * (1 - (enrollment.progressPercent / 100));
    const hrs = Math.floor(remainingSecs / 3600);
    const mins = Math.floor((remainingSecs % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="ld-page-wrapper">
      {/* Sidebar */}
      <nav className="ld-sidebar">
        <div className="ld-sidebar-header">
          <div className="ld-brand-container">
            <div className="ld-brand-icon">
              <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>school</span>
            </div>
            <div className="ld-brand-text">
              <h1>EduCorp</h1>
              <p>Learning Management</p>
            </div>
          </div>
        </div>
        
        <div className="ld-nav-main">
          <Link to="/learner" className="ld-nav-item active">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-sans">Dashboard</span>
          </Link>
          <Link to="/courses" className="ld-nav-item">
            <span className="material-symbols-outlined">explore</span>
            <span className="font-sans">Catalog</span>
          </Link>
        </div>

        <div className="ld-nav-bottom">
          <button className="ld-nav-item ld-logout-btn" onClick={handleLogout}>
            <span className="material-symbols-outlined">logout</span>
            <span className="font-sans">Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Canvas */}
      <div className="ld-main-area">
        {/* Top App Bar */}
        <header className="ld-topbar">
          <button className="ld-mobile-menu-btn">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="ld-mobile-brand">EduCorp LMS</div>

          <div className="ld-search-container">
            <span className="material-symbols-outlined ld-search-icon">search</span>
            <input 
              type="text" 
              className="ld-search-input" 
              placeholder="Search courses, skills, or topics..." 
            />
          </div>

          <div className="ld-topbar-actions">
            <button className="ld-icon-button">
              <span className="material-symbols-outlined">notifications</span>
              <span className="ld-notification-badge"></span>
            </button>
            <button className="ld-icon-button hidden-sm">
              <span className="material-symbols-outlined">settings</span>
            </button>
            <div className="ld-divider-vertical"></div>
            
            <button className="ld-profile-button">
              <img 
                src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=1e293b&color=fff`} 
                alt="Profile" 
                className="ld-profile-img" 
              />
              <div className="ld-profile-info">
                <span className="ld-profile-name">{user?.name || 'Alex Morgan'}</span>
                <span className="ld-profile-role">Learner</span>
              </div>
              <span className="material-symbols-outlined" style={{color: '#94a3b8', fontSize: '14px'}}>expand_more</span>
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="ld-scroll-area">
          <div className="ld-welcome-block">
            <h2>Welcome back, {getFirstName(user?.name)}</h2>
            <p>Pick up where you left off or discover new skills to master.</p>
          </div>

          {/* Section 1: My Enrolled Courses */}
          <section className="ld-section">
            <div className="ld-section-header">
              <h3>My Enrolled Courses</h3>
              <Link to="/courses" className="ld-view-all-link">
                View all <span className="material-symbols-outlined" style={{fontSize: '14px'}}>arrow_forward</span>
              </Link>
            </div>
            
            {isLoadingEnrolled ? (
              <p>Loading your courses...</p>
            ) : enrolledCourses?.length === 0 ? (
               <p>You haven't enrolled in any courses yet.</p>
            ) : (
              <div className="ld-enrolled-grid">
                {enrolledCourses?.map((enrollment) => (
                  <div key={enrollment._id} className="ld-enrolled-card">
                    <div className="ld-card-image-box">
                      {enrollment.progressPercent === 100 && <div className="ld-completed-overlay"></div>}
                      <img 
                        src={enrollment.course.thumbnailUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80"} 
                        alt={enrollment.course.title} 
                        className={`ld-card-image ${enrollment.progressPercent === 100 ? 'completed-img' : ''}`}
                      />
                      <div className={`ld-badge ${enrollment.progressPercent === 100 ? 'ld-badge-completed' : 'ld-badge-progress'}`}>
                        {enrollment.progressPercent === 100 ? (
                          <><span className="material-symbols-outlined" style={{fontSize: '12px'}}>done</span> COMPLETED</>
                        ) : 'IN PROGRESS'}
                      </div>
                    </div>
                    
                    <div className="ld-card-content">
                      <div className="ld-card-category">{enrollment.course.category || "GENERAL"}</div>
                      <h4 className="ld-card-title">{enrollment.course.title}</h4>
                      <p className="ld-card-desc">
                        {enrollment.course.description || "Master the latest skills in this comprehensive course."}
                      </p>
                      
                      <div className="ld-card-footer">
                        {enrollment.progressPercent === 100 ? (
                          <Link to={`/certificates/${enrollment._id}`} className="ld-btn-outline">
                            <span className="material-symbols-outlined" style={{fontSize: '18px'}}>workspace_premium</span>
                            View Certificate
                          </Link>
                        ) : (
                          <>
                            <div className="ld-progress-info">
                              <span className="ld-progress-percent">{enrollment.progressPercent}% Complete</span>
                              <span className="ld-progress-time">{calculateTimeLeft(enrollment)} left</span>
                            </div>
                            <div className="ld-progress-bar-bg">
                              <div className="ld-progress-bar-fill" style={{ width: `${enrollment.progressPercent}%` }}></div>
                            </div>
                            <Link to={`/learn/${enrollment.course._id}`} style={{marginTop: '16px'}} className="ld-btn-primary">
                              Continue Learning
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section 2: Explore Catalog */}
          <section className="ld-section" style={{paddingBottom: '48px'}}>
            <div className="ld-section-header">
              <h3>Explore Catalog</h3>
              <button className="ld-filter-btn">
                <span className="material-symbols-outlined" style={{fontSize: '14px'}}>tune</span>
              </button>
            </div>
            
            {isLoadingCatalog ? (
              <p>Loading catalog...</p>
            ) : (
              <div className="ld-catalog-grid">
                {catalogCourses?.filter(c => !enrolledCourses?.some(e => e.course._id === c._id)).slice(0, 4).map((course) => (
                  <div key={course._id} className="ld-catalog-card">
                    <div className="ld-cat-img-box">
                      <img 
                        src={course.thumbnailUrl || "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=800&q=80"} 
                        alt={course.title} 
                        className="ld-cat-img"
                      />
                      <div className="ld-cat-label">{course.category?.toUpperCase() || "GENERAL"}</div>
                    </div>
                    
                    <div className="ld-cat-content">
                      <h4 className="ld-cat-title">{course.title}</h4>
                      <div className="ld-cat-meta">
                        <div className="ld-cat-meta-item">
                          <span className="material-symbols-outlined" style={{fontSize: '14px'}}>schedule</span> 
                          {formatHours(course.totalDuration || 18000)}
                        </div>
                        <span style={{margin: '0 4px'}}>•</span>
                        <div className="ld-cat-meta-item" style={{color: '#eab308'}}>
                          <span className="material-symbols-outlined" style={{fontSize: '14px'}}>star</span> 
                          {course.rating || 4.8}
                        </div>
                      </div>
                      
                      <Link to={`/courses/${course._id}`} className="ld-btn-primary">
                        Enroll
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
