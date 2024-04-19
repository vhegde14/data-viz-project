from flask import Flask, request, jsonify
from flask_cors import CORS

import pandas as pd
import ast
import numpy as np
import joblib

# Define the column containing the list-like values
value_column = 'Zipcodes'
region_column = 'RegionName'
current_price_column = '2024-02-29'

app = Flask(__name__)

CORS(app)

model = joblib.load('model.pkl')
scaler = joblib.load('scaler.pkl')

# Define the DataFrame
data = pd.read_csv("updated_data.csv")

# Define a function to parse the string into a list (handle potential errors)
def parse_list(value_str):
    if not value_str or pd.isna(value_str):
        return []
    try:
        parsed_list = ast.literal_eval(value_str)
        cleaned_list = [s.strip("'") for s in parsed_list]
        return cleaned_list
    except (ValueError, SyntaxError):
        return []  # Return empty list on parsing errors

data[value_column] = data[value_column].apply(parse_list)

state_abbreviations_to_names = {
    'AL': 'Alabama',
    'AK': 'Alaska',
    'AZ': 'Arizona',
    'AR': 'Arkansas',
    'CA': 'California',
    'CO': 'Colorado',
    'CT': 'Connecticut',
    'DE': 'Delaware',
    'FL': 'Florida',
    'GA': 'Georgia',
    'HI': 'Hawaii',
    'ID': 'Idaho',
    'IL': 'Illinois',
    'IN': 'Indiana',
    'IA': 'Iowa',
    'KS': 'Kansas',
    'KY': 'Kentucky',
    'LA': 'Louisiana',
    'ME': 'Maine',
    'MD': 'Maryland',
    'MA': 'Massachusetts',
    'MI': 'Michigan',
    'MN': 'Minnesota',
    'MS': 'Mississippi',
    'MO': 'Missouri',
    'MT': 'Montana',
    'NE': 'Nebraska',
    'NV': 'Nevada',
    'NH': 'New Hampshire',
    'NJ': 'New Jersey',
    'NM': 'New Mexico',
    'NY': 'New York',
    'NC': 'North Carolina',
    'ND': 'North Dakota',
    'OH': 'Ohio',
    'OK': 'Oklahoma',
    'OR': 'Oregon',
    'PA': 'Pennsylvania',
    'RI': 'Rhode Island',
    'SC': 'South Carolina',
    'SD': 'South Dakota',
    'TN': 'Tennessee',
    'TX': 'Texas',
    'UT': 'Utah',
    'VT': 'Vermont',
    'VA': 'Virginia',
    'WA': 'Washington',
    'WV': 'West Virginia',
    'WI': 'Wisconsin',
    'WY': 'Wyoming'
}


@app.route("/get_latest_home_price_by_zip", methods=["POST"])
def get_latest_home_price_by_zip():
    try:
        search_value = request.json["value"]
    except KeyError:
        return jsonify({"error": "Missing 'value' field in request body"}), 400
    
    mask = data[value_column].apply(lambda x: isinstance(x, list) and search_value in x)
    filtered_df = data.loc[mask & (data.index > 0)]

    if not filtered_df.empty:
        matched_row = filtered_df.iloc[0]
        response = {
            "exists": True,
            "region_name": matched_row[region_column],
            "current_price": matched_row[current_price_column]
        }
    else:
        response = { "exists": False }
    return jsonify(response)

@app.route("/get_all_home_prices_by_zip", methods=["POST"])
def get_all_home_prices_by_zip():
    try:
        search_value = request.json["value"]
    except KeyError:
        return jsonify({"error": "Missing 'value' field in request body"}), 400
    
    mask = data[value_column].apply(lambda x: isinstance(x, list) and search_value in x)
    filtered_df = data.loc[mask & (data.index > 0)]

    if not filtered_df.empty:
        matched_row = filtered_df.iloc[0]
        prices = matched_row[6:].tolist()
        response = {
            "exists": True,
            "region_name": matched_row[region_column],
            "prices": prices
        }
    else:
        response = { "exists": False }
    return jsonify(response)

@app.route("/get_state_average_prices_by_year", methods=["POST"])
def get_state_average_prices_by_year():
    final_data = {}
    for year in range(2000, 2025):                
        priceData = {}
        for state in state_abbreviations_to_names.keys():
            price = data[data['StateName'] == state].iloc[:][f'{year}-01-31'].mean()
            if np.isnan(price):
                price = 0
            priceData[state_abbreviations_to_names[state]] = price
        final_data[year] = priceData
    print('here')
    return jsonify(final_data)

@app.route("/get_price_prediction", methods=["POST"])
def get_price_prediction():
    try:
        air_conditioning = 1 if request.json['airConditioning'] == 'Yes' else 0
        area = 1 if request.json['area'] == 'Yes' else 0
        bathrooms = request.json['bathrooms']
        hotWaterHeating = 1 if request.json['hotWaterHeating'] == 'Yes' else 0
        parkingSpots = request.json['parkingSpots']
        stories = request.json['stories']
    except KeyError:
        return jsonify({"error": "Missing 'value' field in request body"}), 400
    input = pd.DataFrame({'const': [1], 'bathrooms': [float(bathrooms)], 'stories': [float(stories)], 'hotwaterheating': [float(hotWaterHeating)],
                       'parking': [float(parkingSpots)], 'airconditioning': [float(air_conditioning)], 'prefarea': [float(area)]})
    input['stories'] = (input['stories'] - scaler.data_min_[0]) / (scaler.data_max_[0] - scaler.data_min_[0])
    input['bathrooms'] = (input['bathrooms'] - scaler.data_min_[0]) / (scaler.data_max_[0] - scaler.data_min_[0])
    input['airconditioning'] = (input['airconditioning'] - scaler.data_min_[0]) / (scaler.data_max_[0] - scaler.data_min_[0])
    input['prefarea'] = (input['prefarea'] - scaler.data_min_[0]) / (scaler.data_max_[0] - scaler.data_min_[0])
    input['parking'] = (input['parking'] - scaler.data_min_[0]) / (scaler.data_max_[0] - scaler.data_min_[0])
    prediction = model.predict(input)
    min_value = scaler.data_min_[-1]
    max_value = scaler.data_max_[-1]
    output = prediction.to_numpy()[0] * (max_value - min_value) + min_value
    return jsonify({'price': output})

@app.route("/")
def index():
    return "CSE 6242 Project - API"

if __name__ == "__main__":
    app.run(debug=True)