from flask import Flask, request, jsonify
import pandas as pd
import ast

# Define the column containing the list-like values
value_column = 'Zipcodes'
region_column = 'RegionName'
current_price_column = '2024-02-29'

app = Flask(__name__)

@app.route("/get_home_price_by_zip", methods=["POST"])
def get_home_price_by_zip():
    try:
        # Get the value from the request body
        search_value = request.json["value"]
    except KeyError:
        return jsonify({"error": "Missing 'value' field in request body"}), 400
    
    # Define the DataFrame
    data = pd.read_csv("updated_data.csv")
    
    # Define a function to parse the string into a list (handle potential errors)
    def parse_list(value_str):
        print(value_str, type(value_str))
        if not value_str or pd.isna(value_str):
            return []
        try:
            parsed_list = ast.literal_eval(value_str)
            cleaned_list = [s.strip("'") for s in parsed_list]
            return cleaned_list
        except (ValueError, SyntaxError):
            return []  # Return empty list on parsing errors
    
    data[value_column] = data[value_column].apply(parse_list)
    
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

if __name__ == "__main__":
    app.run(port=8000, debug=True)