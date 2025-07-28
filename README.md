# Jackett - Modern Torrent Proxy

A modern, responsive web interface for Jackett built with Vue.js 3, TypeScript, and Tailwind CSS. This application provides a sleek and user-friendly way to search torrents across multiple indexers through Jackett's API.

##  Features

### Core Functionality
- **Multi-Indexer Search**: Search across all configured Jackett indexers simultaneously
- **Real-time Filtering**: Filter results by category, indexer, and search terms
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI/UX**: Clean, intuitive interface with smooth animations and transitions

### Indexer Management
- **Indexer Selection**: Choose which indexers to include in searches
- **Indexer Testing**: Test individual indexer connectivity
- **Configuration Status**: Visual indicators for configured vs unconfigured indexers
- **Persistent Settings**: Indexer selections are saved and restored automatically

### Search & Results
- **Advanced Filtering**: Filter by category, indexer, and search terms
- **Sorting Options**: Sort results by name, seeds, size, or date
- **Pagination**: Navigate through large result sets efficiently
- **Download Links**: Direct download links for torrent files
- **Result Details**: View seeds, peers, size, and other metadata

### Settings & Configuration
- **Jackett Integration**: Easy setup with Jackett base URL and API key
- **Connection Testing**: Test your Jackett connection before searching
- **Persistent Configuration**: Settings are saved in localStorage
- **Secure API Key Handling**: API keys are stored securely with visibility toggle

##  Technology Stack

- **Frontend Framework**: Vue.js 3 with Composition API
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Pinia
- **Icons**: Iconify
- **Notifications**: Vue3-Toastify
- **XML Parsing**: fast-xml-parser
- **Build Tool**: Vite

##  Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Jackett server running and accessible
- Jackett API key

##  Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Jackett
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` (or the URL shown in your terminal)

##  Configuration

### Jackett Setup

1. **Install Jackett** on your server/machine
2. **Configure indexers** in Jackett's web interface
3. **Get your API key** from Jackett's settings
4. **Note your Jackett base URL** 

### Application Configuration

1. **Open the application** in your browser
2. **Click the settings icon** in the top navigation
3. **Enter your Jackett details**:
   - **Base URL**: Your Jackett server URL 
   - **API Key**: Your Jackett API key
4. **Test the connection** to ensure everything is working
5. **Save the settings**

### Indexer Selection

1. **Click the "Indexers" button** in the top navigation
2. **Add indexers** to your search by clicking "+ Add Indexer"
3. **Select desired indexers** from the list
4. **Test indexers** to ensure they're working properly
5. **Save your selection**

##  Usage

### Basic Search
1. **Enter your search term** in the main search box
2. **Press Enter** or click the search button
3. **View results** with details like size, seeds, and peers
4. **Click "Download"** to get the torrent file

### Advanced Filtering
1. **Click the filter icon** next to the search box
2. **Select categories** from the dropdown
3. **Choose specific indexers** to filter by
4. **Use the search box** to filter results by name
5. **Reset filters** when needed

### Result Management
- **Sort results** by name, seeds, size, or date
- **Change results per page** (10, 20, 50)
- **Navigate pages** using the pagination controls
- **Copy download links** for external use

##  Project Structure

```
src/
├── components/          # Vue components
│   ├── Hero.vue        # Main search interface
│   ├── Results.vue     # Search results display
│   ├── Filters.vue     # Filter controls
│   ├── IndexersSidebar.vue  # Indexer management
│   ├── IndexerModal.vue     # Indexer selection modal
│   ├── SettingsBar.vue      # Settings interface
│   ├── Navbar.vue      # Navigation bar
│   └── ...
├── stores/             # Pinia stores
│   └── indexers.ts     # Indexer state management
├── views/              # Page components
├── router/             # Vue Router configuration
└── assets/             # Static assets
```

##  Development

### Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

### Key Components

- **`Hero.vue`**: Main search component with API integration
- **`Results.vue`**: Results display with sorting and pagination
- **`IndexersSidebar.vue`**: Indexer management interface
- **`stores/indexers.ts`**: Centralized state management for indexers

##  Customization

### Styling
The application uses Tailwind CSS for styling. You can customize:
- Colors in `src/assets/main.css`
- Component styles in individual `.vue` files
- Global styles in `src/assets/main.css`

### Configuration
- **Category mapping**: Edit `src/Utlis/categoryMap.json` to customize category names
- **API endpoints**: Modify API calls in components for different Jackett versions
- **UI components**: Extend or modify components as needed

##  Troubleshooting

### Common Issues

1. **"Invalid API Key" error**
   - Verify your API key in Jackett settings
   - Ensure the key is copied correctly (no extra spaces)

2. **"Connection failed" error**
   - Check if Jackett is running
   - Verify the base URL is correct
   - Ensure firewall allows connections to Jackett port

3. **No results found**
   - Check if indexers are selected in the sidebar
   - Verify indexers are configured in Jackett
   - Test individual indexers for connectivity

4. **Categories not showing**
   - Some indexers may not provide category information
   - Check indexer configuration in Jackett

### Debug Mode
Enable browser developer tools to see detailed error messages and API responses.

##  Acknowledgments

- [Jackett](https://github.com/Jackett/Jackett) - The underlying torrent indexer aggregator
- [Vue.js](https://vuejs.org/) - The progressive JavaScript framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Iconify](https://iconify.design/) - Icon framework

##  Support

**Note**: This application is designed to work with Jackett, which aggregates torrent indexers. Please ensure you comply with your local laws and the terms of service of the indexers you use.