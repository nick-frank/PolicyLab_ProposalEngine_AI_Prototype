export type ClassRow = {
  classCode: string;
  description: string;
  locationNumber: string;
  subline: string;
  dominantClass: string;
  liquorLiabilityLimit: string;
  exposures: string;
  zipCode: string;
};

export interface ExposureRatingProps {
  initialInsured?: string;
  initialTerritory?: string;
  initialEffectiveDate?: string;
  initialExpirationDate?: string;
  pl2?: string;
}

export type ExperienceModifierProps = Record<string, never>;

export type LossRow = {
  dateOfLoss: string;
  groundUpIndemnity: string;
  groundUpExpense: string;
};
