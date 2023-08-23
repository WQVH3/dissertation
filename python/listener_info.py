import os
import xml.etree.ElementTree as ET
import pandas as pd
import argparse


def main(args):
    folder_name = args.saves_dir_path

    # Get every XML file in the folder
    dict_results = {}
    headers = ['type', 'name', 'headphones', 'quiet', 'english']
    yes_no = {'yes': 1, 'no': 0}
    english_rating = {'Native':1, 'Excellent':1, 'Good':0.5, 'Basic': 0}

    for file_name in os.listdir(folder_name):
        if (file_name.endswith(".xml")):
            tree = ET.parse(folder_name + '/' + file_name)
            root = tree.getroot()
            
            subject_id = root.get('key');
            
            dict_results[str(subject_id)] = []
            
            for waetresult in root.findall('./waet'):
                file_type = waetresult.get("file-name")[-7:-4]
                dict_results[str(subject_id)].append(file_type)
            for surveyresult in root.findall("./survey/surveyresult"):
                if surveyresult.get('ref') == "name":
                    for response in surveyresult.findall("./response"):
                        dict_results[str(subject_id)].append(response.text)
                if surveyresult.get('ref') == 'headphones':
                    for response in surveyresult.findall('./response'):
                        if response.get('checked') == 'true':  
                            dict_results[str(subject_id)].append(yes_no[response.get('name')])
                if surveyresult.get('ref') == 'quiet':
                    for response in surveyresult.findall('./response'):
                        if response.get('checked') == 'true':
                            dict_results[str(subject_id)].append(yes_no[response.get('name')])
                if surveyresult.get('ref') == 'english':
                    for response in surveyresult.findall('./response'):
                        if response.get('checked') == 'true':
                            dict_results[str(subject_id)].append(english_rating[response.get('name')])

    df_dict_results = pd.DataFrame.from_dict(dict_results, orient='index')
    df_dict_results.columns = headers
    df_dict_results.to_csv(args.csv_path, index_label='file_keys')
    
    print(df_dict_results.to_string())
    print('data loaded and saved')    
    return 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="process the listener info (quiet, headphones, english) from all tests and save as csv in saves/results/")
    
    # Add command-line arguments
    parser.add_argument("--csv_path", type=str, default='./../saves/ratings/listener_info.csv', help="path to where the csv should be saved, default=./../saves/ratings/listener_info.csv")
    parser.add_argument("--saves_dir_path", type=str, default='./../saves', help="relative path to saves folder, default=./../saves/")
    
    args = parser.parse_args()
    
    print(f'Args:\n{args}')
    
    main(args)
