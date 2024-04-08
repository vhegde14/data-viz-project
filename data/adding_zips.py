import pandas as pd
from smartystreets_python_sdk import StaticCredentials, exceptions, Batch, ClientBuilder
from smartystreets_python_sdk.us_street import Lookup as ZIPCodeLookup
from smartystreets_python_sdk.us_street.match_type import MatchType

auth_id = "194c8a19-4060-e7da-8ca3-4ba2bc4d3116"
auth_token = "uUy59IOucJ0qfufrCoyv"

# Create client object
credentials = StaticCredentials(auth_id, auth_token)
client = ClientBuilder(credentials).build_us_zipcode_api_client()
batch = Batch()

# Load csv - neighborhood data
city_df = pd.read_csv('neighborhood_data.csv')

# Add new column for zipcodes
city_df.insert(loc=5, column='Zipcodes', value='')

# Iterate through each entry, lookup zipcode, add to new DF
for index, row in city_df.iterrows():
    if index != 0:
        lookup = ZIPCodeLookup()
        city_name = row['RegionName'].split(', ')[0]
        state_name = row['StateName']
        lookup.city = city_name
        lookup.state = state_name
        lookup.match = MatchType.INVALID
        try:
            client.send_lookup(lookup)
        except exceptions.SmartyException as err:
            print(err)
            continue

        result = lookup.result
        zipcodes = [item.zipcode for item in result.zipcodes]
        city_df.loc[index, 'Zipcodes'] = str(zipcodes)
    if index % 100 == 0:
        print(f'At index {index}')
    
city_df.to_csv('test.csv', index=False)