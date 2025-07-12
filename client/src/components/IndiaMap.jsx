import React from 'react';
import styled from 'styled-components';

const MapContainer = styled.div`
  width: 100%;
  height: 500px;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  background: #f8f9fa;
`;

const SvgMap = styled.svg`
  width: 100%;
  height: 100%;
  cursor: pointer;
  
  path {
    fill: rgba(128, 128, 128, 0.3);
    stroke: #666;
    stroke-width: 1;
    transition: all 0.3s ease;
    cursor: pointer;
    
    &:hover {
      fill: rgba(0, 181, 176, 0.7);
      stroke: #00B5B0;
      stroke-width: 2;
    }
    
    &.has-data {
      fill: rgba(0, 181, 176, 0.3);
    }
    
    &.selected {
      fill: #00B5B0;
      stroke: #00B5B0;
      stroke-width: 2;
    }
  }
`;

const StateLabel = styled.text`
  font-size: 10px;
  font-weight: 500;
  fill: #333;
  text-anchor: middle;
  pointer-events: none;
  opacity: 0.8;
  transition: opacity 0.3s ease;
`;

const IndiaMap = ({ selectedState, onStateClick, stateData }) => {
  const handleStateClick = (event) => {
    const stateId = event.target.getAttribute('data-state-id');
    
    if (stateId && stateData[stateId] && stateData[stateId].dishes.length > 0) {
      onStateClick(stateId);
    }
  };

  const getStateClass = (stateId) => {
    let classes = [];
    if (selectedState === stateId) {
      classes.push('selected');
    }
    if (stateData[stateId] && stateData[stateId].dishes.length > 0) {
      classes.push('has-data');
    }
    return classes.join(' ');
  };

  return (
    <MapContainer>
      <SvgMap viewBox="0 0 1000 700" onClick={handleStateClick}>
        
        {/* Jammu and Kashmir */}
        <path
          d="M 200,80 L 280,75 L 320,90 L 340,110 L 350,130 L 340,150 L 320,165 L 300,175 L 280,180 L 260,175 L 240,165 L 220,150 L 210,130 L 200,110 Z"
          data-state-id="jammu-and-kashmir"
          className={getStateClass('jammu-and-kashmir')}
        />
        
        {/* Ladakh */}
        <path
          d="M 280,75 L 360,70 L 400,85 L 420,105 L 430,125 L 420,145 L 400,160 L 380,170 L 360,175 L 340,170 L 320,160 L 300,145 L 290,125 L 280,105 Z"
          data-state-id="ladakh"
          className={getStateClass('ladakh')}
        />
        
        {/* Himachal Pradesh */}
        <path
          d="M 260,175 L 300,175 L 340,180 L 360,195 L 370,215 L 360,235 L 340,250 L 320,260 L 300,265 L 280,260 L 260,250 L 240,235 L 230,215 L 240,195 Z"
          data-state-id="himachal-pradesh"
          className={getStateClass('himachal-pradesh')}
        />
        
        {/* Punjab */}
        <path
          d="M 220,195 L 260,195 L 280,210 L 300,225 L 310,245 L 300,265 L 280,280 L 260,285 L 240,280 L 220,265 L 210,245 L 215,225 Z"
          data-state-id="punjab"
          className={getStateClass('punjab')}
        />
        
        {/* Haryana */}
        <path
          d="M 280,225 L 320,225 L 340,240 L 360,255 L 370,275 L 360,295 L 340,310 L 320,320 L 300,315 L 280,310 L 260,295 L 250,275 L 260,255 Z"
          data-state-id="haryana"
          className={getStateClass('haryana')}
        />
        
        {/* Delhi */}
        <path
          d="M 315,270 L 335,270 L 345,285 L 340,300 L 330,315 L 315,320 L 300,315 L 295,300 L 300,285 L 310,275 Z"
          data-state-id="delhi"
          className={getStateClass('delhi')}
        />
        
        {/* Uttarakhand */}
        <path
          d="M 340,215 L 380,215 L 400,230 L 420,245 L 430,265 L 420,285 L 400,300 L 380,310 L 360,305 L 340,300 L 320,285 L 310,265 L 320,245 Z"
          data-state-id="uttarakhand"
          className={getStateClass('uttarakhand')}
        />
        
        {/* Uttar Pradesh */}
        <path
          d="M 340,285 L 420,285 L 480,300 L 520,315 L 540,335 L 530,355 L 510,375 L 480,385 L 450,380 L 420,375 L 390,370 L 360,365 L 340,355 L 325,335 L 330,315 Z"
          data-state-id="uttar-pradesh"
          className={getStateClass('uttar-pradesh')}
        />
        
        {/* Rajasthan */}
        <path
          d="M 180,255 L 240,255 L 280,270 L 320,285 L 340,305 L 350,325 L 340,345 L 320,365 L 300,375 L 280,380 L 260,375 L 240,365 L 220,350 L 200,335 L 180,320 L 170,300 L 175,280 Z"
          data-state-id="rajasthan"
          className={getStateClass('rajasthan')}
        />
        
        {/* Gujarat */}
        <path
          d="M 150,325 L 200,325 L 240,340 L 280,355 L 300,375 L 320,395 L 310,415 L 300,435 L 280,450 L 260,455 L 240,450 L 220,435 L 200,420 L 180,405 L 160,390 L 150,370 L 155,350 Z"
          data-state-id="gujarat"
          className={getStateClass('gujarat')}
        />
        
        {/* Madhya Pradesh */}
        <path
          d="M 320,355 L 390,355 L 440,370 L 480,385 L 520,400 L 540,420 L 530,440 L 510,460 L 480,470 L 450,465 L 420,460 L 390,455 L 360,450 L 340,440 L 320,420 L 310,400 L 315,380 Z"
          data-state-id="madhya-pradesh"
          className={getStateClass('madhya-pradesh')}
        />
        
        {/* Maharashtra */}
        <path
          d="M 260,415 L 320,415 L 380,430 L 420,445 L 460,460 L 480,480 L 470,500 L 450,520 L 420,535 L 390,540 L 360,535 L 330,530 L 300,520 L 280,505 L 260,490 L 250,470 L 255,450 Z"
          data-state-id="maharashtra"
          className={getStateClass('maharashtra')}
        />
        
        {/* Goa */}
        <path
          d="M 250,490 L 275,490 L 290,505 L 285,520 L 270,535 L 250,540 L 235,535 L 230,520 L 235,505 L 245,495 Z"
          data-state-id="goa"
          className={getStateClass('goa')}
        />
        
        {/* Karnataka */}
        <path
          d="M 280,505 L 340,505 L 390,520 L 420,535 L 440,555 L 430,575 L 410,595 L 380,610 L 350,615 L 320,610 L 290,605 L 270,590 L 260,570 L 270,550 Z"
          data-state-id="karnataka"
          className={getStateClass('karnataka')}
        />
        
        {/* Kerala */}
        <path
          d="M 270,575 L 300,575 L 320,590 L 340,605 L 350,625 L 340,645 L 320,660 L 300,665 L 280,660 L 265,645 L 260,625 L 265,605 L 270,590 Z"
          data-state-id="kerala"
          className={getStateClass('kerala')}
        />
        
        {/* Tamil Nadu */}
        <path
          d="M 320,605 L 380,605 L 420,620 L 460,635 L 480,655 L 470,675 L 450,690 L 420,700 L 390,695 L 360,690 L 340,675 L 325,655 L 320,635 Z"
          data-state-id="tamil-nadu"
          className={getStateClass('tamil-nadu')}
        />
        
        {/* Andhra Pradesh */}
        <path
          d="M 420,535 L 480,535 L 520,550 L 540,570 L 550,590 L 540,610 L 520,630 L 500,640 L 480,635 L 460,630 L 440,620 L 420,605 L 410,585 L 415,565 Z"
          data-state-id="andhra-pradesh"
          className={getStateClass('andhra-pradesh')}
        />
        
        {/* Telangana */}
        <path
          d="M 420,460 L 480,460 L 520,475 L 540,495 L 530,515 L 510,535 L 480,545 L 450,540 L 420,535 L 400,520 L 390,500 L 400,480 Z"
          data-state-id="telangana"
          className={getStateClass('telangana')}
        />
        
        {/* Chhattisgarh */}
        <path
          d="M 480,385 L 540,385 L 580,400 L 600,420 L 590,440 L 570,460 L 540,470 L 510,465 L 480,460 L 460,445 L 450,425 L 460,405 Z"
          data-state-id="chhattisgarh"
          className={getStateClass('chhattisgarh')}
        />
        
        {/* Odisha */}
        <path
          d="M 540,420 L 590,420 L 620,435 L 640,455 L 630,475 L 610,495 L 580,505 L 550,500 L 530,485 L 520,465 L 530,445 Z"
          data-state-id="odisha"
          className={getStateClass('odisha')}
        />
        
        {/* Jharkhand */}
        <path
          d="M 540,335 L 590,335 L 620,350 L 640,370 L 630,390 L 610,410 L 580,420 L 550,415 L 530,400 L 520,380 L 530,360 Z"
          data-state-id="jharkhand"
          className={getStateClass('jharkhand')}
        />
        
        {/* Bihar */}
        <path
          d="M 520,315 L 580,315 L 620,330 L 640,350 L 630,370 L 610,390 L 580,400 L 550,395 L 530,380 L 520,360 L 525,340 Z"
          data-state-id="bihar"
          className={getStateClass('bihar')}
        />
        
        {/* West Bengal */}
        <path
          d="M 580,315 L 640,315 L 680,330 L 700,350 L 690,370 L 670,390 L 650,405 L 620,410 L 590,405 L 570,390 L 560,370 L 570,350 Z"
          data-state-id="west-bengal"
          className={getStateClass('west-bengal')}
        />
        
        {/* Sikkim */}
        <path
          d="M 640,285 L 665,285 L 675,300 L 670,315 L 655,325 L 640,320 L 635,305 L 640,295 Z"
          data-state-id="sikkim"
          className={getStateClass('sikkim')}
        />
        
        {/* Assam */}
        <path
          d="M 680,315 L 730,315 L 760,330 L 770,350 L 760,370 L 740,385 L 710,390 L 680,385 L 660,370 L 655,350 L 665,330 Z"
          data-state-id="assam"
          className={getStateClass('assam')}
        />
        
        {/* Meghalaya */}
        <path
          d="M 700,350 L 730,350 L 745,365 L 740,380 L 725,390 L 700,385 L 685,375 L 685,360 L 695,355 Z"
          data-state-id="meghalaya"
          className={getStateClass('meghalaya')}
        />
        
        {/* Tripura */}
        <path
          d="M 720,385 L 740,385 L 750,400 L 745,415 L 730,425 L 715,420 L 710,405 L 715,395 Z"
          data-state-id="tripura"
          className={getStateClass('tripura')}
        />
        
        {/* Mizoram */}
        <path
          d="M 730,400 L 750,400 L 760,415 L 755,430 L 740,440 L 725,435 L 720,420 L 725,410 Z"
          data-state-id="mizoram"
          className={getStateClass('mizoram')}
        />
        
        {/* Manipur */}
        <path
          d="M 740,370 L 765,370 L 775,385 L 770,400 L 755,410 L 740,405 L 735,390 L 740,380 Z"
          data-state-id="manipur"
          className={getStateClass('manipur')}
        />
        
        {/* Nagaland */}
        <path
          d="M 730,330 L 765,330 L 775,345 L 770,360 L 755,370 L 730,365 L 720,350 L 725,340 Z"
          data-state-id="nagaland"
          className={getStateClass('nagaland')}
        />
        
        {/* Arunachal Pradesh */}
        <path
          d="M 640,250 L 730,250 L 780,265 L 810,285 L 820,305 L 810,325 L 790,340 L 760,350 L 730,345 L 700,340 L 670,330 L 650,315 L 635,295 L 640,275 Z"
          data-state-id="arunachal-pradesh"
          className={getStateClass('arunachal-pradesh')}
        />
        
        {/* Chandigarh */}
        <path
          d="M 285,235 L 305,235 L 315,250 L 310,265 L 295,275 L 280,270 L 275,255 L 280,245 Z"
          data-state-id="chandigarh"
          className={getStateClass('chandigarh')}
        />
        
        {/* Puducherry */}
        <path
          d="M 420,615 L 440,615 L 450,630 L 445,645 L 430,655 L 415,650 L 410,635 L 415,625 Z"
          data-state-id="puducherry"
          className={getStateClass('puducherry')}
        />
        
        {/* Dadra and Nagar Haveli */}
        <path
          d="M 230,395 L 250,395 L 260,410 L 255,425 L 240,435 L 225,430 L 220,415 L 225,405 Z"
          data-state-id="dadra-and-nagar-haveli"
          className={getStateClass('dadra-and-nagar-haveli')}
        />
        
        {/* Daman and Diu */}
        <path
          d="M 200,410 L 220,410 L 230,425 L 225,440 L 210,450 L 195,445 L 190,430 L 195,420 Z"
          data-state-id="daman-and-diu"
          className={getStateClass('daman-and-diu')}
        />
        
        {/* Lakshadweep */}
        <path
          d="M 120,530 L 140,530 L 150,545 L 145,560 L 130,570 L 115,565 L 110,550 L 115,540 Z"
          data-state-id="lakshadweep"
          className={getStateClass('lakshadweep')}
        />
        
        {/* Andaman and Nicobar Islands */}
        <path
          d="M 850,480 L 870,480 L 880,495 L 875,510 L 860,520 L 845,515 L 840,500 L 845,490 Z"
          data-state-id="andaman-and-nicobar"
          className={getStateClass('andaman-and-nicobar')}
        />
        
        {/* State Labels */}
        <StateLabel x="270" y="115">J&K</StateLabel>
        <StateLabel x="320" y="100">Ladakh</StateLabel>
        <StateLabel x="300" y="220">HP</StateLabel>
        <StateLabel x="250" y="235">Punjab</StateLabel>
        <StateLabel x="320" y="265">Haryana</StateLabel>
        <StateLabel x="325" y="290">Delhi</StateLabel>
        <StateLabel x="380" y="255">Uttarakhand</StateLabel>
        <StateLabel x="430" y="335">Uttar Pradesh</StateLabel>
        <StateLabel x="230" y="305">Rajasthan</StateLabel>
        <StateLabel x="230" y="385">Gujarat</StateLabel>
        <StateLabel x="415" y="410">Madhya Pradesh</StateLabel>
        <StateLabel x="365" y="475">Maharashtra</StateLabel>
        <StateLabel x="265" y="515">Goa</StateLabel>
        <StateLabel x="360" y="560">Karnataka</StateLabel>
        <StateLabel x="285" y="620">Kerala</StateLabel>
        <StateLabel x="390" y="650">Tamil Nadu</StateLabel>
        <StateLabel x="495" y="585">Andhra Pradesh</StateLabel>
        <StateLabel x="465" y="500">Telangana</StateLabel>
        <StateLabel x="520" y="425">Chhattisgarh</StateLabel>
        <StateLabel x="585" y="465">Odisha</StateLabel>
        <StateLabel x="585" y="365">Jharkhand</StateLabel>
        <StateLabel x="575" y="340">Bihar</StateLabel>
        <StateLabel x="625" y="355">West Bengal</StateLabel>
        <StateLabel x="655" y="305">Sikkim</StateLabel>
        <StateLabel x="720" y="350">Assam</StateLabel>
        <StateLabel x="720" y="370">Meghalaya</StateLabel>
        <StateLabel x="730" y="405">Tripura</StateLabel>
        <StateLabel x="745" y="420">Mizoram</StateLabel>
        <StateLabel x="755" y="385">Manipur</StateLabel>
        <StateLabel x="750" y="345">Nagaland</StateLabel>
        <StateLabel x="730" y="295">Arunachal Pradesh</StateLabel>
        <StateLabel x="295" y="255">Chandigarh</StateLabel>
        <StateLabel x="430" y="635">Puducherry</StateLabel>
        <StateLabel x="240" y="415">DNH</StateLabel>
        <StateLabel x="210" y="430">Daman & Diu</StateLabel>
        <StateLabel x="130" y="550">Lakshadweep</StateLabel>
        <StateLabel x="860" y="500">A&N Islands</StateLabel>
        
      </SvgMap>
    </MapContainer>
  );
};

export default IndiaMap;
