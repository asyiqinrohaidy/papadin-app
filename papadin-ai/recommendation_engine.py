# papadin-ai/recommendation_engine.py
"""
Recommendation Engine for Smart Ordering
Uses collaborative filtering to recommend optimal orders based on similar outlets
"""

import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler
import pickle
import os

class OrderRecommendationEngine:
    """
    Recommends optimal orders based on similar outlets' patterns
    """
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.outlet_profiles = {}
        self.similarity_matrix = None
        
    def build_outlet_profiles(self, stock_data):
        """Build profiles for each outlet"""
        df = pd.DataFrame(stock_data)
        df['tarikh'] = pd.to_datetime(df['tarikh'])
        
        for col in ['stockIn', 'baki', 'order']:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
        
        profiles = {}
        
        for outlet in df['outlet'].unique():
            outlet_data = df[df['outlet'] == outlet]
            
            # Calculate profile features
            profile = {}
            for item in outlet_data['item'].unique():
                item_data = outlet_data[outlet_data['item'] == item]
                
                profile[f'{item}_avg_order'] = item_data['order'].mean()
                profile[f'{item}_avg_baki'] = item_data['baki'].mean()
                profile[f'{item}_volatility'] = item_data['order'].std()
            
            profiles[outlet] = profile
        
        return profiles
    
    def calculate_similarity(self):
        """Calculate similarity between outlets"""
        # Convert profiles to matrix
        outlets = list(self.outlet_profiles.keys())
        all_features = set()
        
        for profile in self.outlet_profiles.values():
            all_features.update(profile.keys())
        
        all_features = sorted(list(all_features))
        
        # Build feature matrix
        feature_matrix = []
        for outlet in outlets:
            profile = self.outlet_profiles[outlet]
            features = [profile.get(f, 0) for f in all_features]
            feature_matrix.append(features)
        
        feature_matrix = np.array(feature_matrix)
        
        # Normalize
        feature_matrix_scaled = self.scaler.fit_transform(feature_matrix)
        
        # Calculate cosine similarity
        self.similarity_matrix = cosine_similarity(feature_matrix_scaled)
        
        return outlets
    
    def train(self, stock_data):
        """Build recommendation system"""
        print("💡 Building recommendation engine...")
        
        self.outlet_profiles = self.build_outlet_profiles(stock_data)
        outlets = self.calculate_similarity()
        
        print(f"✅ Built profiles for {len(outlets)} outlets")
        
        self.save_model()
        
        return {
            'success': True,
            'outlets': len(outlets),
            'avg_similarity': float(np.mean(self.similarity_matrix))
        }
    
    def get_recommendations(self, outlet, item, current_baki, top_k=3):
        """Get ordering recommendations based on similar outlets"""
        if outlet not in self.outlet_profiles:
            return {
                'success': False,
                'error': 'Outlet not found in profiles'
            }
        
        # Find similar outlets
        outlets = list(self.outlet_profiles.keys())
        outlet_idx = outlets.index(outlet)
        similarities = self.similarity_matrix[outlet_idx]
        
        # Get top-k similar outlets (excluding self)
        similar_indices = np.argsort(similarities)[::-1][1:top_k+1]
        similar_outlets = [outlets[i] for i in similar_indices]
        
        # Calculate recommendations based on similar outlets
        recommendations = []
        for similar_outlet in similar_outlets:
            similarity_score = similarities[outlets.index(similar_outlet)]
            profile = self.outlet_profiles[similar_outlet]
            avg_order = profile.get(f'{item}_avg_order', 0)
            
            recommendations.append({
                'similar_outlet': similar_outlet.split('@')[0],
                'similarity': float(similarity_score),
                'avg_order': float(avg_order)
            })
        
        # Weighted average recommendation
        total_weight = sum(r['similarity'] for r in recommendations)
        if total_weight > 0:
            weighted_order = sum(r['similarity'] * r['avg_order'] for r in recommendations) / total_weight
        else:
            weighted_order = 0
        
        # Adjust based on current stock
        if current_baki < weighted_order * 0.3:
            urgency = "High"
            recommended_order = int(weighted_order * 1.2)
        elif current_baki < weighted_order * 0.5:
            urgency = "Medium"
            recommended_order = int(weighted_order)
        else:
            urgency = "Low"
            recommended_order = int(weighted_order * 0.8)
        
        return {
            'success': True,
            'item': item,
            'current_baki': current_baki,
            'recommended_order': recommended_order,
            'urgency': urgency,
            'based_on_outlets': recommendations,
            'confidence': float(total_weight / top_k) if top_k > 0 else 0
        }
    
    def get_all_recommendations(self, outlet):
        """Get recommendations for all items for an outlet"""
        if outlet not in self.outlet_profiles:
            return {'success': False, 'error': 'Outlet not found'}
        
        profile = self.outlet_profiles[outlet]
        items = set(key.split('_')[0] for key in profile.keys() if '_avg_order' in key)
        
        all_recommendations = []
        for item in items:
            current_baki = profile.get(f'{item}_avg_baki', 0)
            rec = self.get_recommendations(outlet, item, current_baki)
            if rec['success']:
                all_recommendations.append(rec)
        
        return {
            'success': True,
            'outlet': outlet,
            'recommendations': all_recommendations
        }
    
    def save_model(self):
        """Save recommendation engine"""
        os.makedirs("models/recommendation", exist_ok=True)
        with open("models/recommendation/engine.pkl", 'wb') as f:
            pickle.dump({
                'profiles': self.outlet_profiles,
                'similarity_matrix': self.similarity_matrix,
                'scaler': self.scaler
            }, f)
        print("💾 Recommendation engine saved!")
    
    def load_model(self):
        """Load recommendation engine"""
        with open("models/recommendation/engine.pkl", 'rb') as f:
            data = pickle.load(f)
            self.outlet_profiles = data['profiles']
            self.similarity_matrix = data['similarity_matrix']
            self.scaler = data['scaler']
        print("✅ Recommendation engine loaded!")


if __name__ == "__main__":
    print("💡 Smart Ordering Recommendation Engine")
    print("=" * 50)
    print("\nFeatures:")
    print("  ✅ Collaborative filtering")
    print("  ✅ Outlet similarity analysis")
    print("  ✅ Smart order recommendations")
    print("  ✅ Urgency classification")
    print("  ✅ Confidence scoring")
    print("\nMethod: Cosine Similarity + Weighted Averaging")
