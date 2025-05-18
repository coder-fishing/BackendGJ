// pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import HeroSection from '~/components/UserComponent/Herosection';
import OfferSection from '~/components/UserComponent/OfferSection';
import Step from '~/components/UserComponent/3StepSection';
import CategorySection from '~/components/UserComponent/CategorySection';
import JobCardSection from '~/components/UserComponent/JobCardSection';
import TestimonialSection from '~/components/UserComponent/TestimonialSection';
import ConpaniesSection from '~/components/UserComponent/CompaniesSection';
import NotificationSection from '~/components/UserComponent/NotificationSection';


const DashboardPage = () => {
  
  return (
    <div className='dashboard-page' style={{marginTop:"100px"}}>
          <HeroSection />
          <OfferSection />
          <Step/>
          <CategorySection/>
          <JobCardSection/>
          <TestimonialSection/>
          <ConpaniesSection/>
          <NotificationSection/>
   </div>
  );
};

export default DashboardPage;

