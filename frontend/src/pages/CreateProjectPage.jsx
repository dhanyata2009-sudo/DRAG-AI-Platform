import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Upload, Image as ImageIcon } from "lucide-react";

import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { Field, Input, Textarea, Select } from "../components/common/FormFields";
import { useProjectCreation } from "../hooks/useProjectCreation";
import { platformOptions, adStyleOptions, toneOptions, languageOptions } from "../utils/staticData";
import { ROUTES } from "../utils/constants";
import { createProject, updateProject, uploadProductImage } from "../services/projectService";

const CreateProjectPage = () => {
  const navigate = useNavigate();
  const { data, updateData } = useProjectCreation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [productImageFile, setProductImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(data.productImageUrl || "");

  const handleChange = (event) => {
    updateData({ [event.target.name]: event.target.value });
  };

  const handleProductImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      setError("Please select a JPG, PNG or WEBP image.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Product image must be smaller than 10MB.");
      return;
    }

    setError("");
    setProductImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!data.projectName?.trim() || !data.productName?.trim() || !data.brandName?.trim() || !data.productDescription?.trim()) {
        throw new Error("Please complete all required product details.");
      }

      if (!productImageFile && !data.productImageUrl) {
        throw new Error("Please upload a product image. DRAG.ai uses the original image for product scenes.");
      }

      const payload = {
        projectName: data.projectName.trim(),
        productName: data.productName.trim(),
        brandName: data.brandName.trim(),
        productDescription: data.productDescription.trim(),
        targetAudience: data.targetAudience?.trim() || "",
        marketingGoal: data.marketingGoal?.trim() || "",
        platform: data.platform,
        adStyle: data.adStyle,
        tone: data.tone,
        language: data.language,
        videoDuration: data.videoDuration,
        callToAction: data.callToAction?.trim() || "",
        currentStep: "avatar",
        status: "draft",
      };

      const response = data.projectId
        ? await updateProject(data.projectId, payload)
        : await createProject(payload);

      const project = response?.project || response?.data || response;
      if (!project?._id) throw new Error("Project could not be created.");

      updateData({
        projectId: project._id,
        productImageUrl: project.productImageUrl || data.productImageUrl || null,
      });

      if (productImageFile) {
        const imageResponse = await uploadProductImage(project._id, productImageFile);
        updateData({ productImageUrl: imageResponse.productImageUrl });
      }

      navigate(ROUTES.AVATAR);
    } catch (err) {
      console.error("CREATE PROJECT ERROR:", err);
      setError(err.response?.data?.error || err.response?.data?.message || err.message || "Failed to save project.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-7">
        <h2 className="font-display text-2xl font-semibold text-body">Tell us about the product</h2>
        <p className="text-subtle text-sm mt-1">
          This brief helps Gemini prepare your ad script before HeyGen generates the video and audio.
        </p>
      </div>

      <Card className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Project name" required id="projectName">
              <Input id="projectName" name="projectName" required placeholder="Campaign name" value={data.projectName} onChange={handleChange} />
            </Field>
            <Field label="Product name" required id="productName">
              <Input id="productName" name="productName" required placeholder="Radiance Glow Serum" value={data.productName} onChange={handleChange} />
            </Field>
            <Field label="Brand name" required id="brandName">
              <Input id="brandName" name="brandName" required placeholder="Your brand" value={data.brandName} onChange={handleChange} />
            </Field>
            <Field label="Target audience" id="targetAudience">
              <Input id="targetAudience" name="targetAudience" placeholder="Women aged 18–30" value={data.targetAudience} onChange={handleChange} />
            </Field>
          </div>

          <Field label="Product description" required id="productDescription">
            <Textarea id="productDescription" name="productDescription" required rows={4} placeholder="Describe the product, benefits and important details..." value={data.productDescription} onChange={handleChange} />
          </Field>

          <Field label="Product image" required id="productImage">
            <div className="rounded-2xl border border-dashed border-app overflow-hidden bg-panel-2">
              {imagePreview ? (
                <div className="relative">
                  <div className="flex justify-center p-4">
                    <img src={imagePreview} alt="Product preview" className="max-h-80 max-w-full object-contain rounded-xl" />
                  </div>
                  <label className="flex items-center justify-center gap-2 border-t border-app py-3 cursor-pointer text-sm text-body hover:bg-panel">
                    <Upload size={16} /> Change product image
                    <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleProductImageChange} className="hidden" />
                  </label>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center py-12 cursor-pointer">
                  <div className="h-12 w-12 rounded-xl bg-panel-2 flex items-center justify-center mb-3"><ImageIcon size={22} /></div>
                  <span className="text-sm font-medium text-body">Upload product image</span>
                  <span className="text-xs text-subtle mt-1">PNG, JPG or WEBP · Max 10MB</span>
                  <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleProductImageChange} className="hidden" />
                </label>
              )}
            </div>
          </Field>

          <Field label="Marketing goal" id="marketingGoal">
            <Input id="marketingGoal" name="marketingGoal" placeholder="Drive first-time purchases from Instagram Reels" value={data.marketingGoal} onChange={handleChange} />
          </Field>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Platform" id="platform"><Select id="platform" name="platform" value={data.platform} onChange={handleChange}>{platformOptions.map((o) => <option key={o}>{o}</option>)}</Select></Field>
            <Field label="Ad style" id="adStyle"><Select id="adStyle" name="adStyle" value={data.adStyle} onChange={handleChange}>{adStyleOptions.map((o) => <option key={o}>{o}</option>)}</Select></Field>
            <Field label="Tone" id="tone"><Select id="tone" name="tone" value={data.tone} onChange={handleChange}>{toneOptions.map((o) => <option key={o}>{o}</option>)}</Select></Field>
            <Field label="Language" id="language"><Select id="language" name="language" value={data.language} onChange={handleChange}>{languageOptions.map((o) => <option key={o}>{o}</option>)}</Select></Field>
            <Field label="Video duration" id="videoDuration"><Select id="videoDuration" name="videoDuration" value={data.videoDuration} onChange={handleChange}>{["15s", "30s", "45s", "60s", "90s"].map((o) => <option key={o}>{o}</option>)}</Select></Field>
            <Field label="Call to action" id="callToAction"><Input id="callToAction" name="callToAction" placeholder="Shop now at yourbrand.com" value={data.callToAction} onChange={handleChange} /></Field>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex justify-end pt-2">
            <Button type="submit" icon={ArrowRight} iconPosition="right" disabled={loading}>
              {loading ? "Saving..." : "Continue"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateProjectPage;
