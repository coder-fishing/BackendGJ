import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaUserTie, FaEdit, FaTrash, FaImage, FaCommentAlt, FaClock } from 'react-icons/fa';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './JobCard.scss';

const JobCard = ({ 
  job, 
  onDelete, 
  formatDate, 
  getStatusColor,
  onExtend 
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true
    });

    // Check if job is expired
    const now = new Date();
    const expireDate = new Date(job.expireAt);
    setIsExpired(now > expireDate);
  }, [job.expireAt]);

  const truncateText = (text, lines) => {
    return {
      display: '-webkit-box',
      WebkitLineClamp: lines,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    };
  };

  return (
    <>
      <div 
        className={`job-card ${getStatusColor(job.status)} ${isExpired ? 'status-expired' : ''}`}
        data-aos="fade-up"
        data-aos-delay="100"
      >
        {/* Image Column */}
        <div className="job-image-wrapper">
          {job.imageUrl ? (
            <div className="job-image" onClick={() => setShowPreview(true)}>
              <img src={job.imageUrl} alt={job.title} />
              <div className="image-overlay">
                <FaImage />
              </div>
            </div>
          ) : (
            <div className="job-image job-image-placeholder">
              <FaImage />
            </div>
          )}
        </div>

        {/* Content Column */}
        <div className="job-content">
          <h2 className="job-title">{job.title}</h2>
          
          <div className="job-meta">
            <div className="meta-item dates">
              <span className="posted-date">
                📅 Đăng: {formatDate(job.postedAt)}
              </span>
              <span className="divider">–</span>
              <span className={`expire-date ${isExpired ? 'expired' : ''}`}>
                Hết hạn: {formatDate(job.expireAt)}
              </span>
            </div>

            <div className="meta-item salary">
              <span className="label">Mức lương:</span>
              <span className="value">
                {job.isSalaryPublic ? 
                  `${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} ${job.salaryCurrency}` : 
                  'Thương lượng'}
              </span>
            </div>

            <div className="meta-item tags">
              <span className="location">
                📍 {job.location}
              </span>
              <span className="job-type">{job.jobType}</span>
            </div>

            {job.description && (
              <div className="job-description" style={truncateText(2)}>
                {job.description}
              </div>
            )}

            <div className="job-stats">
              <div className="stat">
                  <FaEye />
                  <span>
                    {job.viewCount > 0 ? `${job.viewCount} lượt xem` : 'Chưa có lượt xem nào'}
                  </span>
                </div>
                <div className="stat">
                  <FaUserTie />
                  <span>
                    {job.applyCount > 0 ? `${job.applyCount} ứng tuyển` : 'Chưa có ứng tuyển nào'}
                  </span>
                </div>
                <div className="stat">
                  <FaCommentAlt />
                  <span>
                    {job.commentCount > 0 ? `${job.commentCount} bình luận` : 'Chưa có bình luận nào'}
                  </span>
                </div>
              </div>
            </div>
        </div>

        {/* Actions Column */}
        <div className="job-actions">
          <div className={`status-badge ${getStatusColor(job.status)}`}>
            {isExpired ? 'Hết hạn  ' + job.status :
              job.status === 'APPROVED' ? 'Được duyệt' :
              job.status === 'PENDING' ? 'Đang chờ' :
              job.status === 'REJECTED' ? 'Từ chối' :
              job.status === 'DELETED' ? 'Đã xóa' :
              'Hết hạn'}
          </div>

          <div className="action-buttons">
            {/* {isExpired && (
              <button 
                className="action-btn extend"
                onClick={() => onExtend(job.jobId)}
                title="Gia hạn"
              >
                <FaClock />
              </button>
            )} */}
            <Link to={`/employer/jobs/edit/${job.jobId}`} className="action-btn edit" title="Chỉnh sửa">
              <FaEdit />
            </Link>
            <button 
              className="action-btn delete"
              onClick={() => onDelete(job.jobId)}
              title="Xóa"
            >
              <FaTrash />
            </button>
          </div>
        </div>
      </div>

      {showPreview && job.imageUrl && (
        <div className="preview-overlay" onClick={() => setShowPreview(false)}>
          <div className="preview-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowPreview(false)}>×</button>
            <img src={job.imageUrl} alt={job.title} />
          </div>
        </div>
      )}
    </>
  );
};

export default JobCard; 