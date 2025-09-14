import React, { useState, useEffect } from 'react';
import {
  Clock,
  MessageCircle,
  Star,
  AlertTriangle,
  CheckCircle,
  Search,
  ChevronRight,
  MapPin,
  Calendar,
  BarChart3
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Header from '../layout/Header';
import sosService, { type SOSComplaint, type ComplaintStats } from '../../services/sosService';

interface SOSHistoryScreenProps {
  onBack: () => void;
  onComplaintSelect?: (complaint: SOSComplaint) => void;
}

const SOSHistoryScreen: React.FC<SOSHistoryScreenProps> = ({ 
  onBack,
  onComplaintSelect
}) => {
  const [complaints, setComplaints] = useState<SOSComplaint[]>([]);
  const [stats, setStats] = useState<ComplaintStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadComplaints();
    loadStats();
  }, [currentPage, filterStatus, filterCategory]);

  const loadComplaints = async () => {
    try {
      setIsLoading(true);
      const response = await sosService.getUserComplaints({
        page: currentPage,
        limit: 10,
        status: filterStatus || undefined,
        category: filterCategory || undefined
      });

      setComplaints(response.complaints);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error: any) {
      console.error('Failed to load complaints:', error);
      toast.error('Failed to load complaint history');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await sosService.getUserComplaintStats();
      setStats(statsData);
    } catch (error: any) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleComplaintClick = (complaint: SOSComplaint) => {
    if (onComplaintSelect) {
      onComplaintSelect(complaint);
    }
  };

  const handleClearFilters = () => {
    setFilterStatus('');
    setFilterCategory('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'in_progress':
      case 'assigned':
        return <Clock size={16} className="text-blue-500" />;
      case 'under_review':
        return <AlertTriangle size={16} className="text-yellow-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-purple-100 text-purple-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'submitted': return 'bg-gray-100 text-gray-800';
      case 'closed': return 'bg-gray-100 text-gray-600';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getCategoryEmoji = (category: string) => {
    const categories = sosService.getHelpCategories();
    const cat = categories.find(c => c.id === category);
    return cat?.icon || '❓';
  };

  const filteredComplaints = complaints.filter(complaint =>
    complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    complaint.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log("filteredComplaints", filteredComplaints)

  return (
    <div className="space-y-4">
      <Header
        title="Help Request History"
        showBack={true}
        onBack={onBack}
        rightAction={
          <button className="text-blue-600 font-medium">
            Export
          </button>
        }
      />

      <div className="px-4 space-y-4">
        {/* Statistics Overview */}
        {stats && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <BarChart3 size={18} className="mr-2" />
              Overview
            </h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
                <div className="text-xs text-gray-600">Resolved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.emergency}</div>
                <div className="text-xs text-gray-600">Emergency</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
                </div>
                <div className="text-xs text-gray-600">Avg Rating</div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="space-y-3">
            {/* Search */}
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search complaints..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex space-x-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex-1 p-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="flex-1 p-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="">All Categories</option>
                <option value="missing_person">Missing Person</option>
                <option value="fire_emergency">Fire Emergency</option>
                <option value="theft_robbery">Theft/Robbery</option>
                <option value="accident">Accident</option>
                <option value="medical_help">Medical Help</option>
                <option value="general_help">General Help</option>
              </select>

              {(filterStatus || filterCategory || searchTerm) && (
                <button
                  onClick={handleClearFilters}
                  className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Complaints List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading complaint history...</p>
            </div>
          ) : filteredComplaints.length > 0 ? (
            filteredComplaints.map((complaint) => (
              <div
                key={complaint._id}
                onClick={() => handleComplaintClick(complaint)}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getCategoryEmoji(complaint.category)}</div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{complaint.title}</h3>
                        <p className="text-sm text-gray-600">ID: {complaint.complaintId}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {complaint.isEmergencySOS && (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                          EMERGENCY
                        </span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(complaint.status || 'submitted')}`}>
                        {(complaint.status || 'submitted').replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {<p className="text-sm text-gray-700 line-clamp-2">
                    {complaint.description}
                  </p>}

                  {/* Details */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Calendar size={12} className="mr-1" />
                        {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : 'Recently'}
                      </span>
                      <span className={`flex items-center font-medium ${getUrgencyColor(complaint.urgency)}`}>
                        <AlertTriangle size={12} className="mr-1" />
                        {complaint.urgency.toUpperCase()}
                      </span>
                      {complaint.location?.address && (
                        <span className="flex items-center">
                          <MapPin size={12} className="mr-1" />
                          {complaint.location.address.length > 20 
                            ? `${complaint.location.address.substring(0, 20)}...` 
                            : complaint.location.address}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(complaint.status || 'submitted')}
                      <ChevronRight size={14} className="text-gray-400" />
                    </div>
                  </div>

                  {/* Communication indicator */}
                  { complaint && (
                    <div className="flex items-center text-xs text-blue-600">
                      <MessageCircle size={12} className="mr-1" />
                      {complaint.description}
                    </div>
                  )}

                  {/* Feedback indicator */}
                  {complaint && (
                    <div className="flex items-center text-xs text-yellow-600">
                      <Star size={12} className="mr-1" />
                      Rated {complaint.description}/5
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
              <AlertTriangle size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">No Complaints Found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterStatus || filterCategory
                  ? 'Try adjusting your search or filters'
                  : 'You haven\'t submitted any help requests yet'}
              </p>
              {(searchTerm || filterStatus || filterCategory) && (
                <button
                  onClick={handleClearFilters}
                  className="text-blue-600 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-blue-600 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-blue-600 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SOSHistoryScreen;