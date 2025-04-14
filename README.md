# Reverie - Call Center Analytics Platform

## 📋 Overview

Reverie is a comprehensive call center analytics platform that provides real-time transcription, translation, sentiment analysis, and performance metrics for call center operations. The platform supports multiple languages with a primary focus on English and Hindi, while being designed to extend to other Indian languages.
![Reverie Technology Login page](https://github.com/nithieshnaik/RLT/blob/main/ReverieTechnologyLoginPage.jpg?raw=true)

## 🌟 Key Features

### Call Transcription & Translation

- Real-time transcription of calls
- Seamless translation between languages (currently English and Hindi)
- Support for bilingual conversations
- Interactive conversation view with speaker identification

### Speaker Identification

- Automatic differentiation between agents and customers
- Speaker timeline visualization
- Voice pattern recognition

### Sentiment Analysis

- Real-time sentiment tracking (Positive, Negative, Neutral)
- Visual sentiment graphs and metrics
- Call sentiment summary

### Call Analytics

- Hold time tracking
- Agent overtalk identification
- Call duration metrics
- Net Promoter Score (NPS) tracking

### Running the Application

-  To run the application locally, start the server and navigate to http://localhost:3000 in your web browser.

### Reporting & Dashboards

- Overall call center performance metrics
- Individual agent performance tracking
- Customizable reporting periods
- Visual data representation with charts and graphs
- Daily, weekly, and monthly trend analysis

### User Management

- Agent profiles and performance history
- Role-based access control
- Profile management

## 💻 Technology Stack

### Frontend

- React.js
- TailwindCSS
- Chart.js for data visualization

### Backend

- Node.js with Express
- MongoDB for data storage

### ML/AI Components

- Speech recognition models for multiple languages
- Sentiment analysis algorithms
- Speaker diarization systems
- Natural Language Processing for translation

### Authentication

- JWT for session management
- Password encryption

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Python 3.8+ (for ML components)

### Installation

1. Clone the repository

```bash
git clone https://github.com/nithieshnaik/RLT.git
cd RLT
```

2.Install backend dependencies

```bash
cd backend
npm install
```

3.Install frontend dependencies

```bash
cd ../frontend
npm install
```

4.Set up environment variables

```bash
cp .env.example .env
# Edit .env with your configuration
```

5.Install ML dependencies

```bash
cd ../ml-services
pip install -r requirements.txt
```

### Running the Application

1. Start the MongoDB services

2. Start the backend server

```bash
cd backend
npm run dev
```

3.Start the frontend development server

```bash
cd frontend
npm start
```

4.Start ML services

```bash
cd ml-services
python app.py
```

## 🔧 Configuration

Configure the platform for your specific needs by adjusting settings in:

- `.env` files for environment variables
- `config/` directory for application configuration
- Language models can be added/modified in the `ml-services/models/` directory

## 📊 Data Storage

Call data, user information, and analytics are stored in MongoDB with the following key collections:

- `calls` - Call metadata and analytics
- `transcripts` - Call transcriptions
- `users` - User profiles and authentication data
- `analytics` - Aggregated analytics data

## 🔐 Security Features

- End-to-end encryption for call data
- Multi-factor authentication
- Role-based access control
- Secure API endpoints with JWT validation
- Regular security audits

## 📱 Supported Platforms

- Web application (Chrome, Firefox, Safari, Edge)

## 🔄 Extendability

### Adding New Languages

1. Add language models to the `ml-services/languages/` directory
2. Update language configuration in `config/languages.js`
3. Add translation mappings in `translations/` directory

### Adding Custom Analytics

1. Implement new analytics processors in `analytics/processors/`
2. Update the frontend visualizations in `frontend/src/components/analytics/`
3. Add new API endpoints in `backend/routes/analytics.js`

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Contact

[Project Link](https://github.com/nithieshnaik/RLT/)

## Contributors

(1) Nithiesh Naik (https://github.com/nithieshnaik/)
(2) Narendra Lal (https://github.com/Narendra9906/)
(3) Muskan Agarwal (https://github.com/muskanagarwal3110/)
(4) Amit Rajput (https://github.com/amitrajput786)
