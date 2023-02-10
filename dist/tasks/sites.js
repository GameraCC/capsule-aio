'use strict';

/*
    Pass site.type into runArgs.type
*/

module.exports = {
    FOOTLOCKER_US_DESKTOP: {
        type: "FOOTLOCKER_US_DESKTOP",
        label: "Footlocker US",
        value: require('./footsites_us_desktop.js'),
        modes: [
            { label: "Card", value: "Card" },
            ...(process.env.NODE_ENV === 'development' ? [{ label: "Paypal", value: "Paypal" }] : [])
        ]
    },
    FOOTLOCKER_CA_DESKTOP: {
        type: "FOOTLOCKER_CA_DESKTOP",
        label: "Footlocker CA",
        value: require('./footsites_us_desktop.js'),
        modes: [
            { label: "Card", value: "Card" },
            ...(process.env.NODE_ENV === 'development' ? [{ label: "Paypal", value: "Paypal" }] : [])
        ]
    },
    CHAMPSSPORTS_US_DESKTOP: {
        type: "CHAMPSSPORTS_US_DESKTOP",
        label: "Champssports US",
        value: require('./footsites_us_desktop.js'),
        modes: [
            { label: "Card", value: "Card" },
            ...(process.env.NODE_ENV === 'development' ? [{ label: "Paypal", value: "Paypal" }] : [])
        ]
    },
    EASTBAY_US_DESKTOP: {
        type: "EASTBAY_US_DESKTOP",
        label: "Eastbay US",
        value: require('./footsites_us_desktop.js'),
        modes: [
            { label: "Card", value: "Card" },
            ...(process.env.NODE_ENV === 'development' ? [{ label: "Paypal", value: "Paypal" }] : [])
        ]
    },
    FOOTACTION_US_DESKTOP: {
        type: "FOOTACTION_US_DESKTOP",
        label: "Footaction US",
        value: require('./footsites_us_desktop.js'),
        modes: [
            { label: "Card", value: "Card" },
            ...(process.env.NODE_ENV === 'development' ? [{ label: "Paypal", value: "Paypal" }] : [])
        ]
    },
    KIDSFOOTLOCKER_US_DESKTOP: {
        type: "KIDSFOOTLOCKER_US_DESKTOP",
        label: "Kidsfootlocker US",
        value: require('./footsites_us_desktop.js'),
        modes: [
            { label: "Card", value: "Card" },
            ...(process.env.NODE_ENV === 'development' ? [{ label: "Paypal", value: "Paypal" }] : [])
        ]
    },
    ...(process.env.NODE_ENV === 'development' && {SPEED_TEST: {
        type: "SPEED_TEST",
        label: "Speed Test",
        value: require('./speedTest.js'),
        modes: [
            { label: "Test", value: "Test"}
        ]
    }}),
    ...(process.env.NODE_ENV === 'development' && {TEMPLATE_SITE: {
        type: "TEMPLATE_SITE",
        label: "Template",
        value: require("./template.js"),
        modes: [
            { label: "Card", value: "Card" },
            { label: "Special", value: "Special" }
        ]
    }}),
    YEEZYSUPPLY: {
        type: "YEEZYSUPPLY",
        label: "Yeezysupply",
        value: require("./yeezysupply.js"),
        modes: [
            { label: "Card", value: "Card" },
            { label: "Special", value: "Special" },
            ...(process.env.NODE_ENV === 'development' ? [{ label: "Adidas", value: "Adidas" }] : []),
        ]
    },
    POLO: {
        type: 'POLO',
        label: 'Polo',
        value: require('./polo.js'),
        modes: [
            {type: 'Card', label: 'Card'}
        ]

    },
    NBA_STORE: {
        type: 'NBA_STORE',
        label: 'NBA Store',
        value: require('./nba.js'),
        modes: [
            {type: 'Card', label: 'Card'}
        ]
    }
}