const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const ip = require('ip');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const cors = require("cors")
// Disable TLS cert verification for testing
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const corsOptions = {
    origin: "*"
}

// 1️⃣ Define the GraphQL Schema
const schema = buildSchema(`
  type Country {
    name: String
    capital: String
    region: String
    subregion: String
    borders: [String]
    population: Int
    flag: String
    area: Float
    mapLink: String
    latlng: [String]
    
  }



  type Query {
    country(name: String!): Country
  }
`);

// Config for IP + port
const CountryInfoExplorer = {
    host: ip.address(),
    port: 4000,
    endpoint: "graphql"
};

// 2️⃣ Define Resolver
const root = {
    country: async ({ name }) => {
        try {
            const response = await fetch(`https://restcountries.com/v3.1/name/${name}`);
            const data = await response.json();
            const country = data.find((item) => item.name.common.toLowerCase() === name.toLowerCase());

            return {
                name: country.name.common,
                capital: country.capital[0],
                region: country.region,
                subregion: country.subregion,
                borders: country.borders,
                population: country.population,
                area: country.area,
                flag: country.flags?.png,
                mapLink: country.maps?.googleMaps,
                latlng: country.capitalInfo.latlng

            };
        } catch (error) {
            console.error('Error fetching country data:', error);
            return null;
        }
    }
};

// 3️⃣ Set up Express App and GraphQL Endpoint
const app = express();
app.use(cors(corsOptions))
app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true, // for testing queries
}));

// 4️⃣ Start Server
app.listen(CountryInfoExplorer.port, () => {
    console.log(`🚀 Server running at http://${CountryInfoExplorer.host}:${CountryInfoExplorer.port}/${CountryInfoExplorer.endpoint}`);
});
