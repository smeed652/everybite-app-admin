query widgets($term: String) {
  widgets(term: $term) {
    
    # Basics
    id
    name
    isActive
    numberOfLocations
    numberOfLocationsSource
    widgetLogoUrl
    widgetUrl
    
    # Ordering
    orderUrl
    isOrderButtonEnabled
    
    # Dates
    createdAt
    updatedAt
    publishedAt
    
    # Branding: General
    backgroundColor
    highlightColor
    primaryBrandColor
    fontFamily

    # Branding: Navbar
    displayNavbar
    navbarFont
    navbarFontSize
    navbarBackgroundColor
    logoUrl
    logoWidth
    faviconUrl
    htmlTitleText
    pageTitleText
    pageTitleTextColor

    # Branding: Content Area
    contentAreaGlobalColor
    contentAreaColumnHeaderColor
    categoryTitleFont
    categoryTitleTextColor

    # Branding: Menu Items
    menuItems {
      ...MenuItemFragment
    }
    menuItemsTextColor
    menuItemsTextHoverColor
    buttonFont
    buttonBackgroundColor
    buttonTextColor
    buttonBorderRadius

    # Branding: Footer
    displayFooter
    footerText
    
    # Display
    displayImages
    layout
    usePagination
    
    # Features: Menu
    isByoEnabled
    
    # Features: Extensions
    displayFeedbackButton
    displaySoftSignUp
    displayDishDetailsLink
    displayGiveFeedbackBanner
    displayNotifyMeBanner
    
    # Features: Search & Filter
    displayIngredients
    displayMacronutrients
    displayNutrientPreferences
    supportedDietaryPreferences
    supportedAllergens
 
    # Features: SmartSell   
    banners {
      ...BannerFragment
    }

   



    
   
    

   
  
   
  }
}
Variables
{"term": "xyz789"}
Response
{
  "data": {
    "widgets": [
      {
        "id": "4",
        "name": "string",
        "orderUrl": "http://www.test.com/",
        "createdAt": "2007-12-03T10:15:30Z",
        "updatedAt": "2007-12-03T10:15:30Z",
        "publishedAt": "2007-12-03T10:15:30Z",
        "backgroundColor": Color,
        "highlightColor": Color,
        "primaryBrandColor": Color,
        "displayImages": true,
        "displayFeedbackButton": false,
        "displaySoftSignUp": true,
        "displayDishDetailsLink": true,
        "displayGiveFeedbackBanner": true,
        "displayNotifyMeBanner": true,
        "displayIngredients": false,
        "displayMacronutrients": false,
        "displayNutrientPreferences": false,
        "isByoEnabled": true,
        "isOrderButtonEnabled": false,
        "fontFamily": Font,
        "layout": "Table",
        "supportedDietaryPreferences": ["Vegan"],
        "supportedAllergens": ["Dairy"],
        "displayNavbar": false,
        "navbarFont": Font,
        "navbarFontSize": 123,
        "navbarBackgroundColor": Color,
        "logoUrl": "http://www.test.com/",
        "logoWidth": 123,
        "faviconUrl": "http://www.test.com/",
        "htmlTitleText": "string",
        "pageTitleText": "string",
        "pageTitleTextColor": Color,
        "menuItems": [MenuItem],
        "menuItemsTextColor": Color,
        "menuItemsTextHoverColor": Color,
        "buttonFont": Font,
        "buttonBackgroundColor": Color,
        "buttonTextColor": Color,
        "buttonBorderRadius": 987,
        "contentAreaGlobalColor": Color,
        "contentAreaColumnHeaderColor": Color,
        "categoryTitleFont": Font,
        "categoryTitleTextColor": Color,
        "usePagination": true,
        "displayFooter": true,
        "footerText": "abc123",
        "numberOfLocations": 987,
        "numberOfLocationsSource": "abc123",
        "widgetLogoUrl": "http://www.test.com/",
        "widgetUrl": "http://www.test.com/",
        "isActive": false,
        "banners": [Banner]
      }
    ]
  }
}