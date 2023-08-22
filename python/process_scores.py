import argparse
import pandas as pd
import numpy as np
from pathlib import Path
import os


def question_bank(question):
    if question[:3] == 'sim':
        return '-'
    elif question[:3] == 'nat':
        return question[4]
    return 'Error'


def load_results_df(path_saves, nat_ref_min):
    df_results = pd.DataFrame()

    # read all csv results files and create dataframe
    for filename in os.listdir(path_saves):
        if filename.endswith(".csv"):
            path_file = path_saves / filename
            
            df_file = pd.read_csv(path_file)
            df_file = df_file.melt(id_vars=['file_keys'])
            
            df_results = pd.concat([df_results, df_file], ignore_index=True)

    # rename columns and unpivot to have each row with a single question answer
    df_results.rename(columns={'variable':'question'}, inplace=True)

    # add info about question. Model, and what question bank it came from, eg. t=tricky, a=alexia (only for nat)
    df_results['question_type'] = df_results['question'].str[:3]
    df_results['model'] = df_results.question.str[-3:]
    is_nat = df_results['question_type'] == 'nat'
    df_results['question_bank'] = df_results.question.apply(question_bank)
    df_results['ref_above_min'] = df_results['value'].apply(lambda x: True if x > nat_ref_min else False)
    return df_results


def get_natural_passed(df_results, avg_nat_ref_min):
    # Return a list of unique ids (file_keys) that scored the natural reference high enough consistently
    df_results_nat_ref = df_results[(df_results['question_type'] == 'nat') * (df_results['model']=='ref')]
    avg_nat_ref = df_results_nat_ref.groupby('file_keys')['ref_above_min'].mean()

    nat_passed = avg_nat_ref[avg_nat_ref > avg_nat_ref_min].index
    return nat_passed


def get_nat_processed_results(df_results, avg_nat_ref_min):
    # get list of ids that passed
    nat_passed = get_natural_passed(df_results, avg_nat_ref_min)
    print(f'{len(nat_passed)} participants passed naturalness')
    # given results and ids of who passed, return a dictionary of scores for each model
    results_nat = {'ref': None, 'mel': None, 'v08': None, 'v09': None, 'v10': None}
    nat_models = ['ref', 'mel', 'v08', 'v09', 'v10']

    for model in nat_models:
        results_nat[model] = np.array(df_results[(df_results['question_type'] == 'nat') * (df_results['model'] == model) * (df_results['file_keys'].isin(nat_passed))].value.tolist())
    
    return results_nat  # dictionary of results


def get_sim_processed_results(df_results):
    results_sim = {'ref': None, 'mel': None, 'v09': None}
    sim_models = ['ref', 'mel', 'v09']

    for model in sim_models:
        results_sim[model] = np.array(df_results[(df_results['question_type'] == 'sim') * (df_results['model'] == model)].value.tolist())
    return results_sim  #dictionary of results


def bootstrap_results(results_type, nb_bootstrap=5000):
    # given a dictionary of results and the number of times to iterate bootstrap, calculate the mean and confidence intervals
    results_mean = {}

    # get the list of results for a specific model, eg. mel
    for model in results_type:
        results = results_type[model]
        N = len(results)
        results_mean[model] = {}
        # calculate the given mean from the original sample
        results_mean[model]['mean'] = results.mean()    
        
        # now repeat bootstrap and calculate distribution of means
        mean_list = []
        for n in range(int(nb_bootstrap)):
            random_sample = np.random.choice(results, size=N, replace=True)
            mean_list.append(random_sample.mean())
        mean_list.sort()
        
        # get the 95% confidence intervals
        lower_index = int(0.025 * nb_bootstrap)
        upper_index = int(0.975 * nb_bootstrap)
        results_mean[model]['lower'] = mean_list[lower_index]
        results_mean[model]['upper'] = mean_list[upper_index]
        
    return results_mean  # dictionary of mean, and CI for each model


def print_results_mean(results_mean, question_type):
    print(f'*****************')
    print(f'{question_type:17}')
    print(f'*****************')
    for model in results_mean:
        mean = results_mean[model]['mean']
        lower = results_mean[model]['lower']
        upper = results_mean[model]['upper']
        print(f'{model}:\n    mean: {mean:0.3f}\n    CI: [{lower:0.2f}, {upper:0.2f}]\n')


def main(args):
    path_saves = Path(args.ratings_path)
    nat_ref_min = args.natural_ref_min  # minimum score for ref for it to be classed as success
    avg_nat_ref_min = args.pct_natural_ref_passed  # average success score for person's results to be used
    
    df_results = load_results_df(path_saves, nat_ref_min)
    results_nat = get_nat_processed_results(df_results, avg_nat_ref_min)
    results_sim = get_sim_processed_results(df_results)
    nat_results_mean = bootstrap_results(results_nat)
    sim_results_mean = bootstrap_results(results_sim)
    
    print_results_mean(nat_results_mean, 'Naturalness')
    print_results_mean(sim_results_mean, 'Similarity')
    

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="process results csv files into confidence intervals for naturalness")
    
    # Add command-line arguments
    parser.add_argument("--natural_ref_min", type=float, default=0.6, help="minimum score for natural reference to be classed as success, default=0.6")
    parser.add_argument("--pct_natural_ref_passed", type=float, default=0.6, help="percent of natural references to pass, default=0.6")
    parser.add_argument("--ratings_path", type=str, default='./../saves/ratings', help="relative path to ratings folder, default=./../saves/ratings")
    
    args = parser.parse_args()
    
    print(f'Args:\n{args}')
    
    main(args)
