'use client';

import { useState } from 'react';

interface Plan {
  id: string;
  duration: string;
  dataAmount: string;
  price: number;
  regularPrice?: number;
  recommended?: boolean;
}

interface PlanSelectorProps {
  plans: Plan[];
  onSelectPlan: (plan: Plan) => void;
}

export default function PlanSelector({ plans, onSelectPlan }: PlanSelectorProps) {
  const [selectedPlan, setSelectedPlan] = useState<Plan>(
    plans.find((p) => p.recommended) || plans[0]
  );

  const handleSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    onSelectPlan(plan);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-heading text-xl font-bold text-gray-900">
        Choose Your Plan
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map((plan) => {
          const isSelected = selectedPlan.id === plan.id;
          const savings = plan.regularPrice && plan.regularPrice > plan.price
            ? plan.regularPrice - plan.price
            : 0;

          return (
            <button
              key={plan.id}
              onClick={() => handleSelect(plan)}
              className={`relative p-6 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? 'border-dancheong-red bg-primary-50 shadow-lg scale-105'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              {/* Recommended Badge */}
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-jade-green text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                  Recommended
                </div>
              )}

              {/* Check Icon */}
              {isSelected && (
                <div className="absolute top-4 right-4">
                  <svg
                    className="w-6 h-6 text-dancheong-red"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}

              {/* Plan Details */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="font-heading text-2xl font-bold text-gray-900">
                    {plan.duration}
                  </span>
                  <span className="text-sm text-gray-600">
                    • {plan.dataAmount}
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-bold ${
                    isSelected ? 'text-dancheong-red' : 'text-gray-900'
                  }`}>
                    ₩{plan.price.toLocaleString()}
                  </span>
                  {plan.regularPrice && plan.regularPrice > plan.price && (
                    <span className="text-lg text-gray-400 line-through">
                      ₩{plan.regularPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Savings Badge */}
                {savings > 0 && (
                  <div className="inline-block bg-jade-green text-white px-2 py-1 rounded text-sm font-bold">
                    Save ₩{savings.toLocaleString()}
                  </div>
                )}

                {/* Price per day */}
                <div className="text-sm text-gray-600">
                  ₩{Math.round(plan.price / parseInt(plan.duration)).toLocaleString()} per day
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Plan Summary */}
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Selected Plan</p>
            <p className="font-heading font-bold text-gray-900">
              {selectedPlan.duration} • {selectedPlan.dataAmount}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">Total</p>
            <p className="font-heading text-2xl font-bold text-dancheong-red">
              ₩{selectedPlan.price.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
