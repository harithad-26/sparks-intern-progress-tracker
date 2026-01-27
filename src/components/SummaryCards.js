import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, CheckCircle, UserCheck, Layers } from 'lucide-react';
import { useInterns } from '../context/InternContext';
import './SummaryCards.css';

const SummaryCards = () => {
  const { getAllInterns, getAvailableBatches } = useInterns();
  const navigate = useNavigate();
  const interns = getAllInterns();
  const batches = getAvailableBatches();

  const stats = {
    total: interns.length,
    active: interns.filter(intern => intern.status === 'active').length,
    dropped: interns.filter(intern => intern.status === 'dropped').length,
    completed: interns.filter(intern => intern.status === 'completed').length,
    totalBatches: batches.length
  };

  const handleCardClick = (cardType) => {
    if (cardType === 'batches') {
      navigate('/batches');
    }
  };

  const cards = [
    {
      title: 'Total Batches',
      value: stats.totalBatches,
      icon: Layers,
      color: 'blue',
      description: 'Available batch groups',
      clickable: true,
      onClick: () => handleCardClick('batches')
    },
    {
      title: 'Total Interns',
      value: stats.total,
      icon: Users,
      color: 'green',
      description: 'All registered interns',
      clickable: false
    },
    {
      title: 'Active Interns',
      value: stats.active,
      icon: UserCheck,
      color: 'orange',
      description: 'Currently enrolled',
      clickable: false
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      color: 'purple',
      description: 'Successfully completed',
      clickable: false
    }
  ];

  return (
    <div className="summary-cards">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <div 
            key={index} 
            className={`summary-card ${card.color} ${card.clickable ? 'clickable' : ''}`}
            onClick={card.clickable ? card.onClick : undefined}
          >
            <div className="card-icon">
              <IconComponent size={26} />
            </div>
            <div className="card-content">
              <div className="card-value">{card.value}</div>
              <div className="card-info">
                <h3 className="card-title">{card.title}</h3>
                <p className="card-description">{card.description}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SummaryCards;